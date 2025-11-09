import { filterConfig } from "../hooks/useFilterConfig";
import { fetchFromBackend } from "./fetchFromBackend";
import { filterFakeData } from "./filterFakeData";
import { flattenWithDependsOn } from "./util";

// Configuration
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const PERSIST_CACHE = false; // Set to true to persist cache across page refreshes
export const CACHE_STORAGE_KEY = "filter-cache";

// In-flight and completed request tracking
let requestCache = new Map();

// Load cache from localStorage on module load if persistence is enabled
if (PERSIST_CACHE && typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      requestCache = new Map(Object.entries(parsed));
      console.log("📦 Loaded cache from localStorage");
    }
  } catch (err) {
    console.error("Failed to load cache from localStorage:", err);
  }
}

// Save cache to localStorage
function saveCache() {
  if (!PERSIST_CACHE || typeof window === "undefined") return;

  try {
    const cacheObj = Object.fromEntries(requestCache);
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObj));
  } catch (err) {
    console.error("Failed to save cache to localStorage:", err);
  }
}

// Helper to create a stable cache key
function createCacheKey(filterName, parentValues, useBackend, extraDeps = []) {
  const sortedParams = parentValues
    .flat()
    .filter((p) => p.id !== -1)
    .map((p) => `${p.key}:${p.id}`)
    .sort()
    .join("|");

  // Include extraDeps in cache key
  const extraKey =
    extraDeps.length > 0 ? `|extra:${JSON.stringify(extraDeps)}` : "";

  return `${filterName}/${
    useBackend ? "backend" : "fake"
  }/${sortedParams}${extraKey}`;
}

// Generic fetcher factory using SWR's mutate for manual cache control
export function createFetcher(filterName, fakeData, endpoint) {
  return async ({ parentValues, extraDeps = [] }) => {
    // Accept extraDeps
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

    const cacheKey = createCacheKey(
      filterName,
      parentValues,
      useBackend,
      extraDeps
    );
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

        // Persist to localStorage if enabled
        saveCache();

        return data;
      })
      .catch((err) => {
        // Remove from cache on error
        requestCache.delete(cacheKey);
        saveCache();
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

// Optional: Export function to manually clear cache
export function clearFilterCache() {
  requestCache.clear();
  if (PERSIST_CACHE && typeof window !== "undefined") {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  }
  console.log("🗑️ Cache cleared");
}
