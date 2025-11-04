// src/hooks/useFilterConfig.js

import { ALL_OPTION } from "../constants/filters";

/**
 * Centralized filter definitions.
 * Add new filters here. defaultValue must be ALL_OPTION (or another appropriate default).
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

  // Example: you can add many more filters, possibly deep dependency chains
  // { name: "neighbourhood", label: "Neighbourhood", dependsOn: ["country","city","store"], defaultValue: ALL_OPTION },
];
