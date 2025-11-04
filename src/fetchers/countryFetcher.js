import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_COUNTRIES } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchCountry({ parentValues }) {
  const [continent] = parentValues;
  let filtered = FAKE_COUNTRIES;
  if (continent && continent.id !== -1)
    filtered = filtered.filter((c) => c.continentId === continent.id);
  return [ALL_OPTION, ...filtered];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useCountryOptions(parentValues) {
  const [continent] = parentValues;
  const continentId = continent?.id !== -1 ? continent.id : "";
  const url = `/api/countries?continentId=${continentId}`;
  const { data, error, isLoading } = useSWR(url, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
