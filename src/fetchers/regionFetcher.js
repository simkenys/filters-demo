import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_REGIONS } from "../data/fakeData";

// Dev / fake fetcher with multi-select parent support
export async function fetchRegion({ parentValues }) {
  const flatParents = parentValues.flat();

  const continentParents = flatParents.filter(
    (p) => p.continentId === undefined
  );
  const countryParents = flatParents.filter(
    (p) => p.countryId !== undefined && p.regionId === undefined
  );

  let filtered = FAKE_REGIONS;

  if (continentParents.length && !continentParents.some((c) => c.id === -1)) {
    const continentIds = continentParents.map((c) => c.id);
    filtered = filtered.filter((r) => continentIds.includes(r.continentId));
  }

  if (countryParents.length && !countryParents.some((c) => c.id === -1)) {
    const countryIds = countryParents.map((c) => c.id);
    filtered = filtered.filter((r) => countryIds.includes(r.countryId));
  }

  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useRegionOptions(parentValues) {
  const flatParents = parentValues.flat();
  const continentParents = flatParents.filter((p) => p.continentId === undefined);
  const countryParents = flatParents.filter((p) => p.countryId !== undefined && p.regionId === undefined);

  const continentIds = continentParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const countryIds = countryParents.filter(c => c.id !== -1).map(c => c.id).join(",");

  const params = [];
  if (continentIds) params.push(`continentId=${continentIds}`);
  if (countryIds) params.push(`countryId=${countryIds}`);
  const url = `/api/regions${params.length ? `?${params.join("&")}` : ""}`;

  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
