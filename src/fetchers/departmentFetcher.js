import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_DEPARTMENTS } from "../data/fakeData";

export async function fetchDepartment({ parentValues }) {
  const [continent, country, region, city, store] = parentValues;
  let filtered = FAKE_DEPARTMENTS;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((d) => d.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((d) => d.countryId === country.id);
  if (region && region.id !== -1)
    filtered = filtered.filter((d) => d.regionId === region.id);
  if (city && city.id !== -1)
    filtered = filtered.filter((d) => d.cityId === city.id);
  if (store && store.id !== -1)
    filtered = filtered.filter((d) => d.storeId === store.id);
  return [ALL_OPTION, ...filtered];
}
