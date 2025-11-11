// utils/fetchByFilter.js
import { filterFakeData } from "./filterFakeData";
import { flattenWithDependsOn } from "./util";

/**
 * Generic fetcher for test/fake data (multi-select safe)
 */
export async function fetchByFilter({ parentValues, data, filterProps }) {
  const flatParents = flattenWithDependsOn(parentValues, filterProps);
  return filterFakeData(data, flatParents);
}
