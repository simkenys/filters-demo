import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_EMPLOYEES } from "../data/fakeData";

export async function fetchEmployee({ parentValues }) {
  const [continent, country, region, city, store, department, team] =
    parentValues;
  let filtered = FAKE_EMPLOYEES;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((e) => e.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((e) => e.countryId === country.id);
  if (region && region.id !== -1)
    filtered = filtered.filter((e) => e.regionId === region.id);
  if (city && city.id !== -1)
    filtered = filtered.filter((e) => e.cityId === city.id);
  if (store && store.id !== -1)
    filtered = filtered.filter((e) => e.storeId === store.id);
  if (department && department.id !== -1)
    filtered = filtered.filter((e) => e.departmentId === department.id);
  if (team && team.id !== -1)
    filtered = filtered.filter((e) => e.teamId === team.id);
  return [ALL_OPTION, ...filtered];
}
