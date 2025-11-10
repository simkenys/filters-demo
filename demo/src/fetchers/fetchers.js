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
 * - FAKE_* data is used for development/testing, you can just provide an empty array [] instead of the FAKE_* dataset in a real API situation
 * - Production endpoints are used when useBackend: true (comes from useFilterConfig.jsx)
 */
export const fetchContinent = createFetcher(
  "continent",
  FAKE_CONTINENTS,
  "http://localhost:4000/continents"
);

export const fetchCountry = createFetcher(
  "country",
  FAKE_COUNTRIES,
  "http://localhost:4000/countries"
);

export const fetchRegion = createFetcher(
  "region",
  FAKE_REGIONS,
  "http://localhost:4000/regions"
);

export const fetchCity = createFetcher(
  "city",
  FAKE_CITIES,
  "http://localhost:4000/cities"
);

export const fetchStore = createFetcher(
  "store",
  FAKE_STORES,
  "http://localhost:4000/stores"
);

export const fetchDepartment = createFetcher(
  "department",
  FAKE_DEPARTMENTS,
  "http://localhost:4000/departments"
);

export const fetchTeam = createFetcher(
  "team",
  FAKE_TEAMS,
  "http://localhost:4000/teams"
);

export const fetchEmployee = createFetcher(
  "employee",
  FAKE_EMPLOYEES,
  "http://localhost:4000/employees"
);
