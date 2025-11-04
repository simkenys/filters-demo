import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_EMPLOYEES } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchEmployee({ parentValues }) {
  const [continent, country, region, city, store, department, team] =
    parentValues;
  let filtered = FAKE_EMPLOYEES;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((e) => e.continentId === continent.id);
  if (country && country.id !== -1)
    filtered = filtered.filter((e) => e.countryId === country.id);
  if (region && region.id !== -1)
    filtered = filtered.filter((e) => e.regionId === region.id);
  if (city && city.id !== -1)
    filtered = filtered.filter((e) => e.cityId === city.id);
  if (store && store.id !== -1)
    filtered = filtered.filter((e) => e.storeId === store.id);
  if (department && department.id !== -1)
    filtered = filtered.filter((e) => e.departmentId === department.id);
  if (team && team.id !== -1)
    filtered = filtered.filter((e) => e.teamId === team.id);
  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useEmployeeOptions(parentValues) {
  const [continent, country, region, city, store, department, team] = parentValues;

  const continentId = continent?.id !== -1 ? continent.id : "";
  const countryId = country?.id !== -1 ? country.id : "";
  const regionId = region?.id !== -1 ? region.id : "";
  const cityId = city?.id !== -1 ? city.id : "";
  const storeId = store?.id !== -1 ? store.id : "";
  const departmentId = department?.id !== -1 ? department.id : "";
  const teamId = team?.id !== -1 ? team.id : "";

  const url = `/api/employees?continentId=${continentId}&countryId=${countryId}&regionId=${regionId}&cityId=${cityId}&storeId=${storeId}&departmentId=${departmentId}&teamId=${teamId}`;

  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });

  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
