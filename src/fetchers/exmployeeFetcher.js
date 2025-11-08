import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_EMPLOYEES } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchEmployee({ parentValues }) {
  const flatParents = parentValues.flat();
  const continentParents = flatParents.filter(
    (p) => p.continentId === undefined
  );
  const countryParents = flatParents.filter(
    (p) => p.countryId !== undefined && p.regionId === undefined
  );
  const regionParents = flatParents.filter(
    (p) => p.regionId !== undefined && p.cityId === undefined
  );
  const cityParents = flatParents.filter(
    (p) => p.cityId !== undefined && p.storeId === undefined
  );
  const storeParents = flatParents.filter(
    (p) => p.storeId !== undefined && p.departmentId === undefined
  );
  const departmentParents = flatParents.filter(
    (p) => p.departmentId !== undefined && p.teamId === undefined
  );
  const teamParents = flatParents.filter((p) => p.teamId !== undefined);

  let filtered = FAKE_EMPLOYEES;

  if (continentParents.length && !continentParents.some((c) => c.id === -1)) {
    const continentIds = continentParents.map((c) => c.id);
    filtered = filtered.filter((e) => continentIds.includes(e.continentId));
  }

  if (countryParents.length && !countryParents.some((c) => c.id === -1)) {
    const countryIds = countryParents.map((c) => c.id);
    filtered = filtered.filter((e) => countryIds.includes(e.countryId));
  }

  if (regionParents.length && !regionParents.some((r) => r.id === -1)) {
    const regionIds = regionParents.map((r) => r.id);
    filtered = filtered.filter((e) => regionIds.includes(e.regionId));
  }

  if (cityParents.length && !cityParents.some((c) => c.id === -1)) {
    const cityIds = cityParents.map((c) => c.id);
    filtered = filtered.filter((e) => cityIds.includes(e.cityId));
  }

  if (storeParents.length && !storeParents.some((s) => s.id === -1)) {
    const storeIds = storeParents.map((s) => s.id);
    filtered = filtered.filter((e) => storeIds.includes(e.storeId));
  }

  if (departmentParents.length && !departmentParents.some((d) => d.id === -1)) {
    const departmentIds = departmentParents.map((d) => d.id);
    filtered = filtered.filter((e) => departmentIds.includes(e.departmentId));
  }

  if (teamParents.length && !teamParents.some((t) => t.id === -1)) {
    const teamIds = teamParents.map((t) => t.id);
    filtered = filtered.filter((e) => teamIds.includes(e.teamId));
  }

  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useEmployeeOptions(parentValues) {
  const flatParents = parentValues.flat();
  const continentParents = flatParents.filter(p => p.continentId === undefined);
  const countryParents = flatParents.filter(p => p.countryId !== undefined && p.regionId === undefined);
  const regionParents = flatParents.filter(p => p.regionId !== undefined && p.cityId === undefined);
  const cityParents = flatParents.filter(p => p.cityId !== undefined && p.storeId === undefined);
  const storeParents = flatParents.filter(p => p.storeId !== undefined && p.departmentId === undefined);
  const departmentParents = flatParents.filter(p => p.departmentId !== undefined && p.teamId === undefined);
  const teamParents = flatParents.filter(p => p.teamId !== undefined);

  const continentIds = continentParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const countryIds = countryParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const regionIds = regionParents.filter(r => r.id !== -1).map(r => r.id).join(",");
  const cityIds = cityParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const storeIds = storeParents.filter(s => s.id !== -1).map(s => s.id).join(",");
  const departmentIds = departmentParents.filter(d => d.id !== -1).map(d => d.id).join(",");
  const teamIds = teamParents.filter(t => t.id !== -1).map(t => t.id).join(",");

  const params = [];
  if (continentIds) params.push(`continentId=${continentIds}`);
  if (countryIds) params.push(`countryId=${countryIds}`);
  if (regionIds) params.push(`regionId=${regionIds}`);
  if (cityIds) params.push(`cityId=${cityIds}`);
  if (storeIds) params.push(`storeId=${storeIds}`);
  if (departmentIds) params.push(`departmentId=${departmentIds}`);
  if (teamIds) params.push(`teamId=${teamIds}`);
  const url = `/api/employees${params.length ? `?${params.join("&")}` : ""}`;

  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
