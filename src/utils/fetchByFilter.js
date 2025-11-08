// utils/fetchByFilter.js
import { ALL_OPTION } from "../hooks/useFilterConstants";
import { flattenWithDependsOn } from "./util";

/**
 * Generic fetcher for test/fake data (multi-select safe)
 */
export async function fetchByFilter({ parentValues, data, filterProps }) {
  const flatParents = flattenWithDependsOn(parentValues, filterProps);

  let filtered = data;

  // Group parents by key for multi-select support
  const grouped = flatParents.reduce((acc, parent) => {
    if (!acc[parent.key]) acc[parent.key] = [];
    acc[parent.key].push(parent);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([key, parents]) => {
    if (parents.some((p) => p.id === -1)) return;
    const ids = parents.map((p) => p.id);
    filtered = filtered.filter((item) => ids.includes(item[`${key}Id`]));
  });

  return [ALL_OPTION, ...filtered];
}
