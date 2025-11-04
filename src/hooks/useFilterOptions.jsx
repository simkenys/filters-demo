// src/hooks/useFilterOptions.js
import { useState, useEffect, useRef } from "react";
import { ALL_OPTION } from "../constants/filters";
import { useFilterConfig } from "./useFilterconfig";

/**
 * Module-level cache shared across hook instances.
 * Key = JSON.stringify([filterName, parentIdsArray, extraDepsArray])
 */
const moduleCache = new Map();

/**
 * Clears the whole cache (call on logout / tenant switch if needed)
 */
export function clearFilterOptionsCache() {
  moduleCache.clear();
}

/**
 * useFilterOptions
 *
 * @param {string} filterName
 * @param {Array} parentValues - ordered array of parent filter objects (matching dependsOn order)
 * @param {Array} extraDeps - optional array of primitives that affect results (userId, orgId, dateRange)
 * @param {object} opts - optional settings { debounceMs: number }
 */
export function useFilterOptions(
  filterName,
  parentValues = [],
  extraDeps = [],
  opts = {}
) {
  const { debounceMs = 120 } = opts;
  const [options, setOptions] = useState([ALL_OPTION]);
  const [loading, setLoading] = useState(false);
  const config = useFilterConfig(); // array of defs with fetcher attached
  const mountedRef = useRef(true);
  const controllerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (controllerRef.current) controllerRef.current.abort?.();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const parentIds = parentValues.map((v) => v?.id ?? -1);
    const cacheKey = JSON.stringify([filterName, parentIds, extraDeps]);

    // immediate cache hit (fast path)
    if (moduleCache.has(cacheKey)) {
      setOptions(moduleCache.get(cacheKey));
      setLoading(false);
      return;
    }

    // debounce fetching to avoid thrash on rapid parent changes
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const def = config.find((c) => c.name === filterName);
      if (!def || typeof def.fetcher !== "function") {
        // no fetcher registered: fallback to ALL
        const fallback = [ALL_OPTION];
        moduleCache.set(cacheKey, fallback);
        if (mountedRef.current) setOptions(fallback);
        return;
      }

      // abort previous
      if (controllerRef.current) {
        try {
          controllerRef.current.abort();
        } catch (e) {
          /* ignore */
        }
      }
      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      setLoading(true);
      try {
        // fetcher must return an array of items (without ALL_OPTION)
        const fetched = await def.fetcher({ parentValues, extraDeps, signal });
        if (!mountedRef.current) return;
        const out = Array.isArray(fetched)
          ? [ALL_OPTION, ...fetched]
          : [ALL_OPTION];
        moduleCache.set(cacheKey, out);
        setOptions(out);
      } catch (err) {
        if (err?.name === "AbortError") {
          // intentional; do nothing
        } else {
          // production: prefer logging to console or a monitoring service
          // eslint-disable-next-line no-console
          console.error("useFilterOptions fetch error for", filterName, err);
          if (mountedRef.current) setOptions([ALL_OPTION]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterName,
    ...parentValues.map((v) => v?.id ?? -1),
    ...extraDeps,
    // debounceMs left out because it's in opts; include if you allow dynamic changes
  ]);

  return { options, loading };
}
