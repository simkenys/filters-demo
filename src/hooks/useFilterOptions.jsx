// src/hooks/useFilterOptions.js
import { useState, useEffect } from "react";
import { ALL_OPTION } from "../constants/filters";
import * as fake from "./useFakeData";

/**
 * Module-level fetcher map (defaults to dev fake fetchers).
 * Use setFilterFetchers() to override this at app start.
 */
let FETCHERS = {
  country: fake.fetchCountries,
  city: fake.fetchCities,
  store: fake.fetchStores,
};

/**
 * Module-level cache shared across hook instances.
 * Key = JSON.stringify([filterName, parentIdsArray, extraDepsArray])
 * Value = options array
 */
const moduleCache = new Map();

/**
 * Replace default fetchers (call at app bootstrap in production).
 * e.g. setFilterFetchers({ country: apiFetchCountries, city: apiFetchCities, ... })
 */
export function setFilterFetchers(fetchers) {
  FETCHERS = { ...FETCHERS, ...fetchers };
}

/**
 * useFilterOptions
 *
 * @param {string} filterName - filter identifier (must correspond to a fetcher)
 * @param {Array} parentValues - array of parent filter objects, in correct order
 * @param {Array} extraDeps - optional array of primitive values to include in cache key (userId, date range, flags)
 */
export function useFilterOptions(
  filterName,
  parentValues = [],
  extraDeps = []
) {
  const [options, setOptions] = useState([ALL_OPTION]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Build stable key: use parent IDs and extraDeps
    const parentIds = parentValues.map((v) => v?.id ?? -1);
    const key = JSON.stringify([filterName, parentIds, extraDeps]);

    // Cache hit
    if (moduleCache.has(key)) {
      setOptions(moduleCache.get(key));
      setLoading(false);
      return;
    }

    // Fetcher lookup
    const fetcher = FETCHERS[filterName];
    if (!fetcher) {
      // no fetcher registered: fallback to ALL_OPTION only
      moduleCache.set(key, [ALL_OPTION]);
      setOptions([ALL_OPTION]);
      setLoading(false);
      return;
    }

    // Execute fetcher - fetcher must accept { parentValues, extraDeps? } and return Promise<options[]>
    fetcher({ parentValues, extraDeps })
      .then((res) => {
        if (!mounted) return;
        const out = Array.isArray(res) && res.length ? res : [ALL_OPTION];
        moduleCache.set(key, out);
        setOptions(out);
      })
      .catch((err) => {
        // production: log error and return safe fallback
        // eslint-disable-next-line no-console
        console.error(`useFilterOptions fetch error for ${filterName}`, err);
        if (mounted) setOptions([ALL_OPTION]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // NOTE: include primitive values from parentIds & extraDeps in deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterName, ...parentValues.map((v) => v?.id ?? -1), ...extraDeps]);

  return { options, loading };
}
