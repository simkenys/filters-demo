import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_TEAMS } from "../data/fakeData";

export async function fetchTeam({ parentValues }) {
  const [continent, country, region, city, store, department] = parentValues;
  let filtered = FAKE_TEAMS;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((t) => t.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((t) => t.countryId === country.id);
  if (region && region.id !== -1)
    filtered = filtered.filter((t) => t.regionId === region.id);
  if (city && city.id !== -1)
    filtered = filtered.filter((t) => t.cityId === city.id);
  if (store && store.id !== -1)
    filtered = filtered.filter((t) => t.storeId === store.id);
  if (department && department.id !== -1)
    filtered = filtered.filter((t) => t.departmentId === department.id);
  return [ALL_OPTION, ...filtered];
}
