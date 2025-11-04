import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_REGIONS } from "../data/fakeData";

export async function fetchRegion({ parentValues }) {
  const [continent, country] = parentValues;
  let filtered = FAKE_REGIONS;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((r) => r.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((r) => r.countryId === country.id);
  return [ALL_OPTION, ...filtered];
}
