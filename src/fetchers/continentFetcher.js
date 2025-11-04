import { ALL_OPTION } from "../hooks/useFilterConstants";
import { FAKE_CONTINENTS } from "../data/fakeData";

// Dev / fake fetcher
export async function fetchContinent() {
  return [ALL_OPTION, ...FAKE_CONTINENTS];
}

/* 
// Production SWR version
import useSWR from "swr";
const swrFetcher = (url) => fetch(url).then(res => res.json());

export function useContinentOptions() {
  const { data, error, isLoading } = useSWR(`/api/continents`, swrFetcher, { revalidateOnFocus: false });
  return {
    options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
    loading: isLoading,
    error,
  };
}
*/
