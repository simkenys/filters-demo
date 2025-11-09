import { filterConfig } from "../hooks/useFilterConfig";
import { fetchFromBackend } from "./fetchFromBackend";
import { filterFakeData } from "./filterFakeData";
import { flattenWithDependsOn } from "./util";

// In-flight and completed request tracking
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (or set to Infinity for permanent cache)

// Helper to create a stable cache key for SWR
function createCacheKey(filterName, parentValues, useBackend) {
  const sortedParams = parentValues
    .flat()
    .filter((p) => p.id !== -1)
    .map((p) => `${p.key}:${p.id}`)
    .sort()
    .join("|");

  return `${filterName}/${useBackend ? "backend" : "fake"}/${sortedParams}`;
}

// Generic fetcher factory using SWR's mutate for manual cache control
export function createFetcher(filterName, fakeData, endpoint) {
  return async ({ parentValues }) => {
    const filterProps = filterConfig.find((f) => f.name === filterName);
    if (!filterProps)
      throw new Error(`Filter config missing for ${filterName}`);

    const useBackend = filterProps.useBackend ?? false;

    // If using fake data, return immediately
    if (!useBackend) {
      return filterFakeData(
        fakeData,
        flattenWithDependsOn(parentValues, filterProps)
      );
    }

    const cacheKey = createCacheKey(filterName, parentValues, useBackend);
    const cached = requestCache.get(cacheKey);

    // If we have a cached entry, check if it's still valid or in-flight
    if (cached) {
      // If promise exists, request is in-flight - return same promise
      if (cached.promise) {
        console.log(
          `⏳ Deduplicating ${filterName} - reusing in-flight request`
        );
        return cached.promise;
      }

      // If data exists and cache is fresh, return cached data
      if (cached.data && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`💾 Using cached ${filterName}`);
        return cached.data;
      }
    }

    // Create new request
    console.log(`🌐 Actually fetching ${filterName} from backend`);

    const promise = fetchFromBackend({ parentValues, filterProps, endpoint })
      .then((data) => {
        // Update cache with data and remove promise
        requestCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          promise: null,
        });
        return data;
      })
      .catch((err) => {
        // Remove from cache on error
        requestCache.delete(cacheKey);
        console.error(
          `[createFetcher] Backend fetch failed for ${filterName}:`,
          err
        );
        return []; // Fallback
      });

    // Store the in-flight promise
    requestCache.set(cacheKey, {
      promise,
      timestamp: Date.now(),
      data: null,
    });

    return promise;
  };
}
