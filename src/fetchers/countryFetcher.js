import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_COUNTRIES } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchCountry({ parentValues }) {
  const flatParents = parentValues.flat();
  const continentParents = flatParents.filter(
    (p) => p.continentId === undefined
  );

  let filtered = FAKE_COUNTRIES;

  if (continentParents.length && !continentParents.some((c) => c.id === -1)) {
    const continentIds = continentParents.map((c) => c.id);
    filtered = filtered.filter((c) => continentIds.includes(c.continentId));
  }

  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useCountryOptions(parentValues) {
  const flatParents = parentValues.flat();
  const continentParents = flatParents.filter((p) => p.continentId === undefined);

  const continentIds = continentParents
    .filter(c => c.id !== -1)
    .map(c => c.id)
    .join(",");

  const url = `/api/countries${continentIds ? `?continentId=${continentIds}` : ""}`;
  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });

  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
