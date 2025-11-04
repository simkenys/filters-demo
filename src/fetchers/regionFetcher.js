import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_REGIONS } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchRegion({ parentValues }) {
  const [continent, country] = parentValues;
  let filtered = FAKE_REGIONS;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((r) => r.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((r) => r.countryId === country.id);
  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useRegionOptions(parentValues) {
  const [continent, country] = parentValues;
  const continentId = continent?.id !== -1 ? continent.id : "";
  const countryId = country?.id !== -1 ? country.id : "";
  const url = `/api/regions?continentId=${continentId}&countryId=${countryId}`;
  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
