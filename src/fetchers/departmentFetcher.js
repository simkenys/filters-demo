import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_DEPARTMENTS } from "../data/fakeData";

// Dev / fake fetcher
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

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useDepartmentOptions(parentValues) {
  const [continent, country, region, city, store] = parentValues;
  const continentId = continent?.id !== -1 ? continent.id : "";
  const countryId = country?.id !== -1 ? country.id : "";
  const regionId = region?.id !== -1 ? region.id : "";
  const cityId = city?.id !== -1 ? city.id : "";
  const storeId = store?.id !== -1 ? store.id : "";
  const url = `/api/departments?continentId=${continentId}&countryId=${countryId}&regionId=${regionId}&cityId=${cityId}&storeId=${storeId}`;
  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
