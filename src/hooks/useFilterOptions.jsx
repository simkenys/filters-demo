import { useState, useEffect } from "react";
import { ALL_OPTION } from "../constants/filters";

// Dev fetchers (replace with real API in prod)
import { fetchCountries, fetchCities, fetchStores } from "./useFakeData";

/**
 * Returns options for a filter and loading state
 * @param {string} filterName
 * @param {Array} parentValues
 */
export const useFilterOptions = (filterName, parentValues) => {
  const [options, setOptions] = useState([ALL_OPTION]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchMap = {
      country: fetchCountries,
      city: fetchCities,
      store: fetchStores,
    };

    const fetcher = fetchMap[filterName];
    if (!fetcher) return;

    fetcher({ parentValues })
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

  return { options, loading };
};
