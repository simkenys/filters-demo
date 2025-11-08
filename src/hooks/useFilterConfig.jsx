import {
  fetchContinent,
  fetchCity,
  fetchCountry,
  fetchDepartment,
  fetchEmployee,
  fetchRegion,
  fetchStore,
  fetchTeam,
} from "../fetchers/fetchers";
import { ALL_OPTION } from "./useFilterConstants";

/**
 * Filter configuration: metadata only
 * - name: unique key
 * - label: UI label
 * - defaultValue: default selection
 * - dependsOn: all ancestor dependencies
 * - fetcher: function that fetches options based on parent values
 */
export const filterConfig = [
  {
    name: "continent",
    label: "Continent",
    defaultValue: ALL_OPTION,
    dependsOn: [],
    fetcher: fetchContinent,
    isMulti: true,
  },
  {
    name: "country",
    label: "Country",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent"],
    fetcher: fetchCountry,
    isMulti: true,
  },
  {
    name: "region",
    label: "Region",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country"],
    fetcher: fetchRegion,
    isMulti: true,
  },
  {
    name: "city",
    label: "City",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country", "region"],
    fetcher: fetchCity,
  },
  {
    name: "store",
    label: "Store",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country", "region", "city"],
    fetcher: fetchStore,
  },
  {
    name: "department",
    label: "Department",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country", "region", "city", "store"],
    fetcher: fetchDepartment,
  },
  {
    name: "team",
    label: "Team",
    defaultValue: ALL_OPTION,
    dependsOn: [
      "continent",
      "country",
      "region",
      "city",
      "store",
      "department",
    ],
    fetcher: fetchTeam,
  },
  {
    name: "employee",
    label: "Employee",
    defaultValue: ALL_OPTION,
    dependsOn: [
      "continent",
      "country",
      "region",
      "city",
      "store",
      "department",
      "team",
    ],
    fetcher: fetchEmployee,
  },
];
