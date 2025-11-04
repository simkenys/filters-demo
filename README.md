# Filters Dashboard – README

## Project Overview

This project is a React + MUI dashboard with dynamic filters. Filters are hierarchical and dependent:

- Country → City → Store → (optional new filters)
- Each filter can be set to "All" or a specific value.
- Filter state is globally managed with `FiltersContext`.
- Development uses fake data; production uses SWR for API fetching.

## Folder Structure

```
src/
│
├─ context/
│ └─ FiltersContext.jsx # Global filter state and provider
│
├─ hooks/
│ ├─ useFakeData.js # Fake data fetch functions for dev
│ └─ useFilterOptions.js # Hook to fetch options (fake or SWR)
│
├─ components/
│ ├─ filters/
│ │ ├─ FilterSelect.jsx # Single select component
│ │ └─ ActiveFiltersBar.jsx # Shows currently active filters
│ │
│ └─ Dashboard/
│ └─ DashboardExample.jsx # Example dashboard layout
│
└─ App.jsx # Entry point
```

## Installation & Running

```bash

# Install dependencies

npm install

# or

yarn install

# Start development server

npm run dev

# or

yarn dev
```

## Development vs Production

### Development

- Uses fake data in `useFakeData.js`.
- Filters update dynamically based on parent selections.
- Console logs filter changes in `DashboardExample.jsx`.

### Production

- Replace the fake fetch logic in `useFilterOptions.js` with SWR + API endpoints.
- Example mapping:

```js
const urlMap = {
  country: "/api/countries",
  city: `/api/cities?countryId=\${parentValues[0]?.id ?? ''}`,
  store: `/api/stores?countryId=\${parentValues[0]?.id ?? ''}&cityId=\${parentValues[1]?.id ?? ''}`,
  category: `/api/categories?storeId=\${parentValues[0]?.id ?? ''}`,
};
```

- Use SWR for fetching:

```js
import useSWR from "swr";
const { data, isLoading } = useSWR(urlMap[filterName], fetcher);
return {
  options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
  loading: isLoading,
};
```

## Adding a New Filter

Follow these steps to add a new filter (e.g., "Category"):

### 1. Update Default State

Add the new key in `FiltersContext.jsx`:

```js
category: { id: -1, label: "All" }
```

### 2. Add Fake Data

In `hooks/useFakeData.js`:

```js
const FAKE_CATEGORIES = [
  { id: 1, storeId: 1, label: "Electronics" },
  { id: 2, storeId: 1, label: "Clothing" },
  { id: 3, storeId: 2, label: "Groceries" },
  { id: 4, storeId: 3, label: "Books" },
];

export const fetchCategories = async ({ parentValues }) => {
  await new Promise((r) => setTimeout(r, 100));
  const [store] = parentValues;
  let filtered = FAKE_CATEGORIES;
  if (store && store.id !== -1)
    filtered = filtered.filter((c) => c.storeId === store.id);
  return [{ id: -1, label: "All" }, ...filtered];
};
```

### 3. Update `useFilterOptions.js`

Add the new filter to the fetch map:

```js
const fetchMap = {
  country: fetchCountries,
  city: fetchCities,
  store: fetchStores,
  category: fetchCategories,
};
```

### 4. Add `FilterSelect` to Dashboard

In `DashboardExample.jsx`:

```jsx
<Box width={250}>
  <FilterSelect name="category" label="Category" dependsOn={["store"]} />
</Box>
```

- `dependsOn` must reference parent filters.

### 5. Production Setup

Update the URL mapping in `useFilterOptions.js`:

```js
category: `/api/categories?storeId=\${parentValues[0]?.id ?? ''}`;
```

Replace the fake fetch with SWR:

```js
const { data, isLoading } = useSWR(urlMap[filterName], fetcher);
return {
  options: data ? [ALL_OPTION, ...data] : [ALL_OPTION],
  loading: isLoading,
};
```

### 6. Active Filters

No code changes required.  
`ActiveFiltersBar` automatically picks up new filters from `FiltersContext`.

## Key Notes

- All filters use id: -1 for "All".
- `FilterSelect` does not need modification when adding new filters.
- `useFilterOptions` centralizes fetch logic; just update it for new filters.
- Dependencies (`dependsOn`) ensure child filters update automatically when parent filters change.
