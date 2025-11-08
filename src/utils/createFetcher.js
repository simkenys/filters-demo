import { filterConfig } from "../hooks/useFilterConfig";
import { fetchFromBackend } from "./fetchFromBackend";
import { filterFakeData } from "./filterFakeData";
import { flattenWithDependsOn } from "./util";

export function createFetcher(name, fakeData, endpoint) {
  return async ({ parentValues }) => {
    const filterProps = filterConfig.find((f) => f.name === name);
    if (!filterProps) throw new Error(`Filter config missing for ${name}`);

    const useBackend = filterProps.useBackend ?? false; // ✅ read from config

    if (useBackend) {
      try {
        const data = await fetchFromBackend({
          parentValues,
          filterProps,
          endpoint,
        });
        return data;
      } catch (err) {
        console.error(`[createFetcher] Backend fetch failed for ${name}:`, err);

        // fallback: empty array (or you could throw in prod)
        return [];
      }
    }

    // dev mode: use fake data
    return filterFakeData(
      fakeData,
      flattenWithDependsOn(parentValues, filterProps)
    );
  };
}
