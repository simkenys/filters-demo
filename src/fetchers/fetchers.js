import { ALL_OPTION } from "../hooks/useFilterConstants";
import { filterConfig } from "../hooks/useFilterConfig";
import { fetchFromBackend } from "../utils/fetchFromBackend";
import { flattenWithDependsOn } from "../utils/util";
// Fake data imports
import {
  FAKE_CONTINENTS,
  FAKE_COUNTRIES,
  FAKE_REGIONS,
  FAKE_CITIES,
  FAKE_STORES,
  FAKE_DEPARTMENTS,
  FAKE_TEAMS,
  FAKE_EMPLOYEES,
} from "../data/fakeData";

// Helper for local filtering
function filterFakeData(data, flatParents) {
  let filtered = data;
  const grouped = flatParents.reduce((acc, p) => {
    if (!acc[p.key]) acc[p.key] = [];
    acc[p.key].push(p);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([key, parents]) => {
    if (parents.some((p) => p.id === -1)) return;
    const ids = parents.map((p) => p.id);
    filtered = filtered.filter((item) => ids.includes(item[`${key}Id`]));
  });

  return [ALL_OPTION, ...filtered];
}

// CONTINENT
export async function fetchContinent({ parentValues, useBackend = false }) {
  const filterProps = filterConfig.find((f) => f.name === "continent");
  if (useBackend) {
    const data = await fetchFromBackend({
      parentValues,
      filterProps,
      endpoint: "/api/continents",
    });
    return [ALL_OPTION, ...data];
  }
  return filterFakeData(
    FAKE_CONTINENTS,
    flattenWithDependsOn(parentValues, filterProps)
  );
}

// COUNTRY
export async function fetchCountry({ parentValues, useBackend = false }) {
  const filterProps = filterConfig.find((f) => f.name === "country");
  if (useBackend) {
    const data = await fetchFromBackend({
      parentValues,
      filterProps,
      endpoint: "/api/countries",
    });
    return [ALL_OPTION, ...data];
  }
  return filterFakeData(
    FAKE_COUNTRIES,
    flattenWithDependsOn(parentValues, filterProps)
  );
}

// REGION
export async function fetchRegion({ parentValues, useBackend = false }) {
  const filterProps = filterConfig.find((f) => f.name === "region");
  if (useBackend) {
    const data = await fetchFromBackend({
      parentValues,
      filterProps,
      endpoint: "/api/regions",
    });
    return [ALL_OPTION, ...data];
  }
  return filterFakeData(
    FAKE_REGIONS,
    flattenWithDependsOn(parentValues, filterProps)
  );
}

// CITY
export async function fetchCity({ parentValues, useBackend = false }) {
  const filterProps = filterConfig.find((f) => f.name === "city");
  if (useBackend) {
    const data = await fetchFromBackend({
      parentValues,
      filterProps,
      endpoint: "/api/cities",
    });
    return [ALL_OPTION, ...data];
  }
  return filterFakeData(
    FAKE_CITIES,
    flattenWithDependsOn(parentValues, filterProps)
  );
}

// STORE
export async function fetchStore({ parentValues, useBackend = false }) {
  const filterProps = filterConfig.find((f) => f.name === "store");
  if (useBackend) {
    const data = await fetchFromBackend({
      parentValues,
      filterProps,
      endpoint: "/api/stores",
    });
    return [ALL_OPTION, ...data];
  }
  return filterFakeData(
    FAKE_STORES,
    flattenWithDependsOn(parentValues, filterProps)
  );
}

// DEPARTMENT
export async function fetchDepartment({ parentValues, useBackend = false }) {
  const filterProps = filterConfig.find((f) => f.name === "department");
  if (useBackend) {
    const data = await fetchFromBackend({
      parentValues,
      filterProps,
      endpoint: "/api/departments",
    });
    return [ALL_OPTION, ...data];
  }
  return filterFakeData(
    FAKE_DEPARTMENTS,
    flattenWithDependsOn(parentValues, filterProps)
  );
}

// TEAM
export async function fetchTeam({ parentValues, useBackend = false }) {
  const filterProps = filterConfig.find((f) => f.name === "team");
  if (useBackend) {
    const data = await fetchFromBackend({
      parentValues,
      filterProps,
      endpoint: "/api/teams",
    });
    return [ALL_OPTION, ...data];
  }
  return filterFakeData(
    FAKE_TEAMS,
    flattenWithDependsOn(parentValues, filterProps)
  );
}

// EMPLOYEE
export async function fetchEmployee({ parentValues, useBackend = false }) {
  const filterProps = filterConfig.find((f) => f.name === "employee");
  if (useBackend) {
    const data = await fetchFromBackend({
      parentValues,
      filterProps,
      endpoint: "/api/employees",
    });
    return [ALL_OPTION, ...data];
  }
  return filterFakeData(
    FAKE_EMPLOYEES,
    flattenWithDependsOn(parentValues, filterProps)
  );
}
