import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_STORES } from "../data/fakeData";

export async function fetchStore({ parentValues }) {
  const [continent, country, region, city] = parentValues;
  let filtered = FAKE_STORES;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((s) => s.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((s) => s.countryId === country.id);
  if (region && region.id !== -1)
    filtered = filtered.filter((s) => s.regionId === region.id);
  if (city && city.id !== -1)
    filtered = filtered.filter((s) => s.cityId === city.id);
  return [ALL_OPTION, ...filtered];
}
