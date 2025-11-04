import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_CITIES } from "../data/fakeData";

export async function fetchCity({ parentValues }) {
  const [continent, country, region] = parentValues;
  let filtered = FAKE_CITIES;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((c) => c.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((c) => c.countryId === country.id);
  if (region && region.id !== -1)
    filtered = filtered.filter((c) => c.regionId === region.id);
  return [ALL_OPTION, ...filtered];
}
