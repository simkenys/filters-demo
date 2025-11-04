import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_CITIES } from "../data/fakeData";

// Dev / fake fetcher
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

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useCityOptions(parentValues) {
  const [continent, country, region] = parentValues;
  const continentId = continent?.id !== -1 ? continent.id : "";
  const countryId = country?.id !== -1 ? country.id : "";
  const regionId = region?.id !== -1 ? region.id : "";
  const url = `/api/cities?continentId=${continentId}&countryId=${countryId}&regionId=${regionId}`;
  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
