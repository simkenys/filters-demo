import {
  FAKE_CITIES,
  FAKE_CONTINENTS,
  FAKE_COUNTRIES,
  FAKE_DEPARTMENTS,
  FAKE_EMPLOYEES,
  FAKE_REGIONS,
  FAKE_STORES,
  FAKE_TEAMS,
} from "../data/fakeData";
import { createFetcher } from "../utils/createFetcher";

/**
 * Fetchers for each filter.
 * - FAKE_* data is used for development/testing
 * - Production endpoints are used when useBackend: true (comes from useFilterConfig.jsx)
 */
export const fetchContinent = createFetcher(
  "continent",
  FAKE_CONTINENTS,
  "/api/continents"
);

export const fetchCountry = createFetcher(
  "country",
  FAKE_COUNTRIES,
  "/api/countries"
);

export const fetchRegion = createFetcher(
  "region",
  FAKE_REGIONS,
  "/api/regions"
);

export const fetchCity = createFetcher("city", FAKE_CITIES, "/api/cities");

export const fetchStore = createFetcher("store", FAKE_STORES, "/api/stores");

export const fetchDepartment = createFetcher(
  "department",
  FAKE_DEPARTMENTS,
  "/api/departments"
);

export const fetchTeam = createFetcher("team", FAKE_TEAMS, "/api/teams");

export const fetchEmployee = createFetcher(
  "employee",
  FAKE_EMPLOYEES,
  "/api/employees"
);
