// hooks/useFilterConfig.js
import { ALL_OPTION } from "../constants/filters";

/**
 * Centralized filter definitions
 */
export const useFilterConfig = () => [
  {
    name: "country",
    label: "Country",
    dependsOn: [],
    defaultValue: ALL_OPTION,
  },
  {
    name: "city",
    label: "City",
    dependsOn: ["country"],
    defaultValue: ALL_OPTION,
  },
  {
    name: "store",
    label: "Store",
    dependsOn: ["country", "city"],
    defaultValue: ALL_OPTION,
  },
];
