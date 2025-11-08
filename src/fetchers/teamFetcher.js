import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_TEAMS } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchTeam({ parentValues }) {
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
    (p) => p.departmentId !== undefined
  );

  let filtered = FAKE_TEAMS;

  if (continentParents.length && !continentParents.some((c) => c.id === -1)) {
    const continentIds = continentParents.map((c) => c.id);
    filtered = filtered.filter((t) => continentIds.includes(t.continentId));
  }

  if (countryParents.length && !countryParents.some((c) => c.id === -1)) {
    const countryIds = countryParents.map((c) => c.id);
    filtered = filtered.filter((t) => countryIds.includes(t.countryId));
  }

  if (regionParents.length && !regionParents.some((r) => r.id === -1)) {
    const regionIds = regionParents.map((r) => r.id);
    filtered = filtered.filter((t) => regionIds.includes(t.regionId));
  }

  if (cityParents.length && !cityParents.some((c) => c.id === -1)) {
    const cityIds = cityParents.map((c) => c.id);
    filtered = filtered.filter((t) => cityIds.includes(t.cityId));
  }

  if (storeParents.length && !storeParents.some((s) => s.id === -1)) {
    const storeIds = storeParents.map((s) => s.id);
    filtered = filtered.filter((t) => storeIds.includes(t.storeId));
  }

  if (departmentParents.length && !departmentParents.some((d) => d.id === -1)) {
    const departmentIds = departmentParents.map((d) => d.id);
    filtered = filtered.filter((t) => departmentIds.includes(t.departmentId));
  }

  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useTeamOptions(parentValues) {
  const flatParents = parentValues.flat();
  const continentParents = flatParents.filter(p => p.continentId === undefined);
  const countryParents = flatParents.filter(p => p.countryId !== undefined && p.regionId === undefined);
  const regionParents = flatParents.filter(p => p.regionId !== undefined && p.cityId === undefined);
  const cityParents = flatParents.filter(p => p.cityId !== undefined && p.storeId === undefined);
  const storeParents = flatParents.filter(p => p.storeId !== undefined && p.departmentId === undefined);
  const departmentParents = flatParents.filter(p => p.departmentId !== undefined);

  const continentIds = continentParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const countryIds = countryParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const regionIds = regionParents.filter(r => r.id !== -1).map(r => r.id).join(",");
  const cityIds = cityParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const storeIds = storeParents.filter(s => s.id !== -1).map(s => s.id).join(",");
  const departmentIds = departmentParents.filter(d => d.id !== -1).map(d => d.id).join(",");

  const params = [];
  if (continentIds) params.push(`continentId=${continentIds}`);
  if (countryIds) params.push(`countryId=${countryIds}`);
  if (regionIds) params.push(`regionId=${regionIds}`);
  if (cityIds) params.push(`cityId=${cityIds}`);
  if (storeIds) params.push(`storeId=${storeIds}`);
  if (departmentIds) params.push(`departmentId=${departmentIds}`);
  const url = `/api/teams${params.length ? `?${params.join("&")}` : ""}`;

  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
