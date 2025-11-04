import { useState, useEffect, useRef } from "react";
import { ALL_OPTION } from "./useFilterConstants";
import { filterConfig } from "./useFilterConfig";

/**
 * Production-ready hook to fetch filter options
 *
 * @param {string} filterName - name of the filter
 * @param {array} parentValues - array of all ancestor filter values
 * @param {array} extraDeps - optional extra dependencies affecting options
 * @param {object} opts - { debounceMs } optional debounce in ms
 */
export function useFilterOptions(
  filterName,
  parentValues = [],
  extraDeps = [],
  opts = {}
) {
  const { debounceMs = 100 } = opts;
  const [options, setOptions] = useState([ALL_OPTION]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    // Abort previous request if parentValues change
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const conf = filterConfig.find((f) => f.name === filterName);
        if (!conf)
          throw new Error(`useFilterOptions: Unknown filter ${filterName}`);

        const fetched = await conf.fetcher({ parentValues });
        if (!signal.aborted) setOptions(fetched);
      } catch (err) {
        if (!signal.aborted) console.error(err);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controllerRef.current?.abort();
    };
  }, [
    ...parentValues.map((v) => v?.id ?? -1),
    ...extraDeps,
    filterName,
    debounceMs,
  ]);

  return { options, loading };
}
