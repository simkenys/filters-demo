import { filterConfig } from "../hooks/useFilterConfig";
import { fetchFromBackend } from "./fetchFromBackend";
import { filterFakeData } from "./filterFakeData";
import { flattenWithDependsOn } from "./util";

/**
 * Creates a fetcher for a given filter.
 *
 * @param {string} name - filter name
 * @param {Array} fakeData - array of fake options for dev/testing
 * @param {string} endpoint - API endpoint for production
 *
 * Returns a function that:
 * - uses fakeData if useBackend is false
 * - fetches from backend if useBackend is true
 */
export function createFetcher(name, fakeData, endpoint) {
  return async ({ parentValues, useBackend = false }) => {
    const filterProps = filterConfig.find((f) => f.name === name);
    if (!filterProps) throw new Error(`Filter config missing for ${name}`);

    return useBackend
      ? fetchFromBackend({ parentValues, filterProps, endpoint })
      : filterFakeData(
          fakeData,
          flattenWithDependsOn(parentValues, filterProps)
        );
  };
}
