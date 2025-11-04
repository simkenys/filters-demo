import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_TEAMS } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchTeam({ parentValues }) {
  const [continent, country, region, city, store, department] = parentValues;
  let filtered = FAKE_TEAMS;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((t) => t.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((t) => t.countryId === country.id);
  if (region && region.id !== -1)
    filtered = filtered.filter((t) => t.regionId === region.id);
  if (city && city.id !== -1)
    filtered = filtered.filter((t) => t.cityId === city.id);
  if (store && store.id !== -1)
    filtered = filtered.filter((t) => t.storeId === store.id);
  if (department && department.id !== -1)
    filtered = filtered.filter((t) => t.departmentId === department.id);
  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useTeamOptions(parentValues) {
  const [continent, country, region, city, store, department] = parentValues;

  const continentId = continent?.id !== -1 ? continent.id : "";
  const countryId = country?.id !== -1 ? country.id : "";
  const regionId = region?.id !== -1 ? region.id : "";
  const cityId = city?.id !== -1 ? city.id : "";
  const storeId = store?.id !== -1 ? store.id : "";
  const departmentId = department?.id !== -1 ? department.id : "";

  const url = `/api/teams?continentId=${continentId}&countryId=${countryId}&regionId=${regionId}&cityId=${cityId}&storeId=${storeId}&departmentId=${departmentId}`;

  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });

  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
