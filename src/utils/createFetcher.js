import { filterConfig } from "../hooks/useFilterConfig";
import { fetchFromBackend } from "./fetchFromBackend";
import { filterFakeData } from "./filterFakeData";
import { flattenWithDependsOn } from "./util";
import { mutate } from "swr";

// Helper to create a stable cache key for SWR
function createCacheKey(filterName, parentValues, useBackend) {
  const sortedParams = parentValues
    .flat()
    .filter((p) => p.id !== -1)
    .map((p) => `${p.key}:${p.id}`)
    .sort()
    .join("|");

  // Include useBackend in key to separate fake vs real data cache
  return `${filterName}/${useBackend ? "backend" : "fake"}/${sortedParams}`;
}

// Generic fetcher factory using SWR's mutate for manual cache control
export function createFetcher(filterName, fakeData, endpoint) {
  return async ({ parentValues }) => {
    const filterProps = filterConfig.find((f) => f.name === filterName);
    if (!filterProps)
      throw new Error(`Filter config missing for ${filterName}`);

    const useBackend = filterProps.useBackend ?? false;

    // If using fake data, don't use SWR cache (fake data is instant anyway)
    if (!useBackend) {
      return filterFakeData(
        fakeData,
        flattenWithDependsOn(parentValues, filterProps)
      );
    }

    // Backend fetch with SWR deduplication
    const cacheKey = createCacheKey(filterName, parentValues, useBackend);

    try {
      // Use SWR's mutate to fetch with automatic deduplication
      const data = await mutate(
        cacheKey,
        async () => {
          console.log(`🌐 Actually fetching ${filterName} from backend`);
          return fetchFromBackend({ parentValues, filterProps, endpoint });
        },
        {
          revalidate: false,
          populateCache: true,
          rollbackOnError: true,
        }
      );

      return data;
    } catch (err) {
      console.error(
        `[createFetcher] Backend fetch failed for ${filterName}:`,
        err
      );
      // Fallback: empty array (or throw in prod)
      return [];
    }
  };
}
