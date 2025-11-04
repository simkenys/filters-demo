import { FAKE_CONTINENTS } from "../data/fakeData";
import { ALL_OPTION } from "../hooks/useFilterConstants";

export async function fetchContinent() {
  return [ALL_OPTION, ...FAKE_CONTINENTS];
}
