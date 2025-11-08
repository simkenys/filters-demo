// hooks/useFilterSWR.js
import useSWR from "swr";
import { fetchByFilter } from "../utils/fetchByFilter";
import { fetchFromBackend } from "../utils/fetchFromBackend";

/**
 * Generic SWR hook for filters
 * @param {Array} parentValues
 * @param {Array|undefined} data - optional test data (dev)
 * @param {Object} filterProps
 * @param {string|undefined} endpoint - optional backend endpoint (prod)
 */
export function useFilterSWR({
  parentValues,
  data,
  filterProps,
  endpoint,
  enabled = true,
}) {
  const flatParents = parentValues
    .map((level, idx) =>
      level.map((p) => ({ ...p, key: filterProps.dependsOn[idx] }))
    )
    .flat();

  const swrKey = enabled
    ? endpoint
      ? `${endpoint}?parents=${encodeURIComponent(JSON.stringify(flatParents))}`
      : `${filterProps.name}?parents=${encodeURIComponent(
          JSON.stringify(flatParents)
        )}`
    : null;

  const fetcher = endpoint
    ? () => fetchFromBackend({ parentValues, endpoint, filterProps })
    : () => fetchByFilter({ parentValues, data, filterProps });

  const {
    data: swrData,
    error,
    mutate,
    isValidating,
  } = useSWR(swrKey, fetcher);

  return {
    data: swrData,
    error,
    isLoading: !swrData && !error,
    mutate,
    isValidating,
  };
}
