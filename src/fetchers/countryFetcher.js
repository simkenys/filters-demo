import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_COUNTRIES } from "../data/fakeData";

export async function fetchCountry({ parentValues }) {
  const [continent] = parentValues;
  let filtered = FAKE_COUNTRIES;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((c) => c.continentId === continent.id);
  return [ALL_OPTION, ...filtered];
}
