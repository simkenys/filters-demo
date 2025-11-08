import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_CITIES } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchCity({ parentValues }) {
  const flatParents = parentValues.flat();
  const continentParents = flatParents.filter(
    (p) => p.continentId === undefined
  );
  const countryParents = flatParents.filter(
    (p) => p.countryId !== undefined && p.regionId === undefined
  );
  const regionParents = flatParents.filter((p) => p.regionId !== undefined);

  let filtered = FAKE_CITIES;

  if (continentParents.length && !continentParents.some((c) => c.id === -1)) {
    const continentIds = continentParents.map((c) => c.id);
    filtered = filtered.filter((c) => continentIds.includes(c.continentId));
  }

  if (countryParents.length && !countryParents.some((c) => c.id === -1)) {
    const countryIds = countryParents.map((c) => c.id);
    filtered = filtered.filter((c) => countryIds.includes(c.countryId));
  }

  if (regionParents.length && !regionParents.some((r) => r.id === -1)) {
    const regionIds = regionParents.map((r) => r.id);
    filtered = filtered.filter((c) => regionIds.includes(c.regionId));
  }

  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useCityOptions(parentValues) {
  const flatParents = parentValues.flat();
  const continentParents = flatParents.filter((p) => p.continentId === undefined);
  const countryParents = flatParents.filter((p) => p.countryId !== undefined && p.regionId === undefined);
  const regionParents = flatParents.filter((p) => p.regionId !== undefined);

  const continentIds = continentParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const countryIds = countryParents.filter(c => c.id !== -1).map(c => c.id).join(",");
  const regionIds = regionParents.filter(r => r.id !== -1).map(r => r.id).join(",");

  const params = [];
  if (continentIds) params.push(`continentId=${continentIds}`);
  if (countryIds) params.push(`countryId=${countryIds}`);
  if (regionIds) params.push(`regionId=${regionIds}`);
  const url = `/api/cities${params.length ? `?${params.join("&")}` : ""}`;

  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
