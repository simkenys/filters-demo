import { useState, useEffect } from "react";
import {
  ALL_OPTION,
  fetchCountries,
  fetchCities,
  fetchStores,
} from "./useFakeData";

/**
 * Example fetcher function for SWR
 * @param {string} url
 */
const fetcher = (url) => fetch(url).then((res) => res.json());

/**
 * Hook to get filter options (countries, cities, stores)
 *
 * parentValues: array of parent filter objects, e.g. [country, city]
 * filterName: 'country' | 'city' | 'store'
 *
 * This hook currently uses fake fetches for dev.
 * In production, replace with SWR + your real API URLs.
 */
export function useFilterOptions(filterName, parentValues) {
  const [options, setOptions] = useState([ALL_OPTION]);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // DEV: use fake fetches
  // -------------------------
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchMap = {
      country: fetchCountries,
      city: fetchCities,
      store: fetchStores,
    };
    const fetcherFn = fetchMap[filterName];
    if (!fetcherFn) return;

    fetcherFn({ parentValues })
      .then((opts) => {
        if (isMounted) setOptions(opts);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [...parentValues.map((v) => v?.id ?? -1), filterName]);

  // -------------------------
  // PROD: Example SWR usage
  // -------------------------
  // const urlMap = {
  //   country: '/api/countries',                  // GET list of countries
  //   city: `/api/cities?countryId=${parentValues[0]?.id ?? ''}`,  // GET cities for country
  //   store: `/api/stores?countryId=${parentValues[0]?.id ?? ''}&cityId=${parentValues[1]?.id ?? ''}` // GET stores
  // };
  //
  // const { data, isLoading } = useSWR(urlMap[filterName], fetcher, {
  //   revalidateOnFocus: false,
  // });
  //
  // return { options: data ? [ALL_OPTION, ...data] : [ALL_OPTION], loading: isLoading };

  return { options, loading };
}
