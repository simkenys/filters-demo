export const ALL_OPTION = { id: -1, label: "All" };

// -------------------- Fake Data --------------------
const FAKE_COUNTRIES = [
  { id: 1, label: "United States" },
  { id: 2, label: "Belgium" },
  { id: 3, label: "Japan" },
];

const FAKE_CITIES = [
  { id: 1, countryId: 1, label: "New York" },
  { id: 2, countryId: 1, label: "Los Angeles" },
  { id: 3, countryId: 2, label: "Brussels" },
  { id: 4, countryId: 3, label: "Tokyo" },
];

const FAKE_STORES = [
  { id: 1, countryId: 1, cityId: 1, label: "Store A" },
  { id: 2, countryId: 1, cityId: 2, label: "Store B" },
  { id: 3, countryId: 2, cityId: 3, label: "Store C" },
  { id: 4, countryId: 3, cityId: 4, label: "Store D" },
];

// -------------------- Fake Fetches (DEV) --------------------
export const fetchCountries = async () => {
  await new Promise((r) => setTimeout(r, 100));
  return [ALL_OPTION, ...FAKE_COUNTRIES];
};

export const fetchCities = async ({ parentValues }) => {
  await new Promise((r) => setTimeout(r, 100));
  const [country] = parentValues;
  const filtered =
    !country || country.id === -1
      ? FAKE_CITIES
      : FAKE_CITIES.filter((c) => c.countryId === country.id);
  return [ALL_OPTION, ...filtered];
};

export const fetchStores = async ({ parentValues }) => {
  await new Promise((r) => setTimeout(r, 100));
  const [country, city] = parentValues;
  let filtered = FAKE_STORES;
  if (country && country.id !== -1)
    filtered = filtered.filter((s) => s.countryId === country.id);
  if (city && city.id !== -1)
    filtered = filtered.filter((s) => s.cityId === city.id);
  return [ALL_OPTION, ...filtered];
};
