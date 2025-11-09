import { useState, useEffect, useRef } from "react";
import { filterConfig } from "./useFilterConfig";

/**
 * Production-ready hook to fetch filter options
 *
 * @param {string} filterName - name of the filter
 * @param {array} parentValues - array-of-arrays of parent filter values
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
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);

  // Create stable dependency string
  const parentValuesKey = JSON.stringify(
    parentValues.map((arr) => arr.map((v) => v.id ?? -1))
  );
  const extraDepsKey = JSON.stringify(extraDeps);

  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const conf = filterConfig.find((f) => f.name === filterName);
        if (!conf)
          throw new Error(`useFilterOptions: Unknown filter ${filterName}`);

        // Call fetcher with structured parentValues
        const fetched = await conf.fetcher({ parentValues, extraDeps });
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
  }, [filterName, debounceMs, parentValuesKey, extraDepsKey]);

  return { options, loading };
}
