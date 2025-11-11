import { ALL_OPTION } from "filtersprovider";
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

/**
 * Global option: whether child filters should reset when a parent filter changes.
 * true  → child filters reset automatically
 * false → child filters retain their current value if the value is a proper value for the parent selection
      export const resetDependencies = false 
      is now part of the FilterProvider
*/

/**
 * Filter configuration: metadata only
 * Fields:
 * - name: unique key
 * - label: UI label
 * - defaultValue: default selection
 * - dependsOn: parent filters this depends on
 * - fetcher: fetcher function
 * - isMulti: optional, multi-select
 * - useBackend: whether to fetch from API (true) or use FAKE_* data (false)
 * - isAutoComplete: true or false
 *
 * Switch from dev → prod:
 * - Currently useBackend: true → development with FAKE_* data is useBackend: false
 * - Production: set useBackend to true
 * - Fake data locally: set useBackend to false
 */

export const filterConfig = [
  {
    name: "continent",
    label: "Continent",
    defaultValue: ALL_OPTION,
    dependsOn: [],
    fetcher: fetchContinent,
    useBackend: false,
  },
  {
    name: "country",
    label: "Country",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent"],
    fetcher: fetchCountry,
    useBackend: false,
  },
  {
    name: "region",
    label: "Region",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country"],
    fetcher: fetchRegion,

    useBackend: false,
  },
  {
    name: "city",
    label: "City",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country", "region"],
    fetcher: fetchCity,
    useBackend: false,
  },
  {
    name: "store",
    label: "Store",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country", "region", "city"],
    fetcher: fetchStore,
    useBackend: false,
    isMulti: true,
  },
  {
    name: "department",
    label: "Department",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country", "region", "city", "store"],
    fetcher: fetchDepartment,
    useBackend: false,
    isMulti: true,
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
    useBackend: false,
    hide: true,
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
    useBackend: false,
    hide: true,
  },
];
