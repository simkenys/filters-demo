import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_STORES } from "../data/fakeData";

// Dev / fake fetcher
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

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useStoreOptions(parentValues) {
  const [continent, country, region, city] = parentValues;
  const continentId = continent?.id !== -1 ? continent.id : "";
  const countryId = country?.id !== -1 ? country.id : "";
  const regionId = region?.id !== -1 ? region.id : "";
  const cityId = city?.id !== -1 ? city.id : "";
  const url = `/api/stores?continentId=${continentId}&countryId=${countryId}&regionId=${regionId}&cityId=${cityId}`;
  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
