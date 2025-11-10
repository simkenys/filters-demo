# FiltersProvider Library

A production-ready React filters library with URL synchronization, dependency management, and Material-UI components.
(This Git also contains a demo example project)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Peer Dependencies](#peer-dependencies)
  - [Optional Dependencies](#optional-dependencies)
- [Quick Start](#quick-start)
  - [1. Define Your Filter Configuration](#1-define-your-filter-configuration)
  - [2. Wrap Your App with FiltersProvider](#2-wrap-your-app-with-filtersprovider)
  - [3. Use Filter Components](#3-use-filter-components)
- [API Reference](#api-reference)
  - [FiltersProvider](#filtersprovider)
  - [useFilters Hook](#usefilters-hook)
  - [useFilterOptions Hook](#usefilteroptions-hook)
- [Filter Configuration](#filter-configuration)
  - [FilterConfig Object](#filterconfig-object)
  - [Fetcher Function](#fetcher-function)
- [Available Filter Components](#available-filter-components)
  - [FilterSelect](#filterselect)
  - [FilterMultiSelect](#filtermultiselect)
  - [FilterAutoCompleteSelect](#filterautocompleteselect)
  - [FilterAutoCompleteMultiSelect](#filterautocompletemultiselect)
  - [FilterSelectVirtualized](#filterselectvirtualized)
  - [FilterMultiSelectVirtualized](#filtermultiselectvirtualized)
  - [FilterAutoCompleteSelectVirtualized](#filterautocompleteselectvirtualized)
  - [FilterAutoCompleteMultiSelectVirtualized](#filterautocompletemultiselectvirtualized)
  - [SelectAuto](#selectauto)
- [Debug Components](#debug-components)
  - [FilterOptionsCountDisplay](#filteroptionscountdisplay)
- [URL Synchronization](#url-synchronization)
- [Advanced Usage](#advanced-usage)
  - [Custom Filter Components](#custom-filter-components)
  - [Conditional Filters](#conditional-filters)
  - [Backend vs Mock Data](#backend-vs-mock-data)
- [Troubleshooting](#troubleshooting)
- [Browser Support](#browser-support)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

## Features

- ✅ **URL Synchronization** - Filter state automatically syncs with URL parameters
- ✅ **Dependent Filters** - Cascading filters with automatic dependency management
- ✅ **Multi-Select Support** - Single and multi-select filters
- ✅ **Backend Integration** - Flexible fetcher functions for dynamic options
- ✅ **Loading States** - Built-in loading indicators during filter updates
- ✅ **Material-UI Components** - Beautiful, accessible filter components
- ✅ **Virtualized Lists** - Performance optimization for large option lists
- ✅ **TypeScript Ready** - Full type definitions included

## Installation

```bash
npm install filtersprovider
```

### Peer Dependencies

```bash
npm install react@^19 react-dom@^19 react-router-dom@^7 @mui/material@^7 @emotion/react @emotion/styled
```

### Optional Dependencies

For virtualized filter lists:

```bash
npm install react-window
```

For MUI icons in filters:

```bash
npm install @mui/icons-material
```

## Quick Start

### 1. Define Your Filter Configuration

Create a `filterConfig.js` file in your project:

```javascript
// src/filterConfig.js
export const filterConfig = [
  {
    name: "country",
    label: "Country",
    isMulti: false,
    defaultValue: { id: -1, label: "All Countries" },
    fetcher: async ({ parentValues, useBackend }) => {
      const response = await fetch("/api/countries");
      return response.json();
    },
  },
  {
    name: "region",
    label: "Region",
    isMulti: true,
    defaultValue: { id: -1, label: "All Regions" },
    dependsOn: ["country"],
    fetcher: async ({ parentValues, useBackend }) => {
      const [countryValues] = parentValues;
      const countryIds = countryValues
        .map((c) => c.id)
        .filter((id) => id !== -1);

      if (countryIds.length === 0) return [];

      const response = await fetch(
        `/api/regions?countries=\${countryIds.join(",")}`
      );
      return response.json();
    },
  },
  {
    name: "city",
    label: "City",
    isMulti: true,
    defaultValue: { id: -1, label: "All Cities" },
    dependsOn: ["country", "region"],
    fetcher: async ({ parentValues, useBackend }) => {
      const [countryValues, regionValues] = parentValues;
      const regionIds = regionValues.map((r) => r.id).filter((id) => id !== -1);

      if (regionIds.length === 0) return [];

      const response = await fetch(
        `/api/cities?regions=\${regionIds.join(",")}`
      );
      return response.json();
    },
  },
];
```

### 2. Wrap Your App with FiltersProvider

```javascript
// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { FiltersProvider } from "filtersprovider";
import { filterConfig } from "./filterConfig";
import Dashboard from "./Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <FiltersProvider config={filterConfig} resetDependencies={false}>
        <Dashboard />
      </FiltersProvider>
    </BrowserRouter>
  );
}
```

### 3. Use Filter Components

```javascript
// src/Dashboard.jsx
import { useFilters } from "filtersprovider";
import {
  FilterSelect,
  FilterAutoCompleteSelect,
  FilterAutoCompleteMultiSelect,
} from "filtersprovider/filters";

export default function Dashboard() {
  const { state, isLoading } = useFilters();

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Single select dropdown */}
      <FilterSelect filterName="country" />

      {/* Multi-select autocomplete */}
      <FilterAutoCompleteMultiSelect filterName="region" />

      {/* Virtualized multi-select for large lists */}
      <FilterAutoCompleteMultiSelectVirtualized filterName="city" />

      {isLoading && <p>Loading filters...</p>}

      {/* Access filter state */}
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

## API Reference

### `FiltersProvider`

Wraps your application and manages filter state.

**Props:**

| Prop                | Type             | Required | Default | Description                                            |
| ------------------- | ---------------- | -------- | ------- | ------------------------------------------------------ |
| `config`            | `FilterConfig[]` | ✅       | -       | Array of filter configurations                         |
| `resetDependencies` | `boolean`        | ❌       | `false` | Reset dependent filters to default when parent changes |
| `children`          | `ReactNode`      | ✅       | -       | Your app components                                    |

**Example:**

```javascript
<FiltersProvider config={filterConfig} resetDependencies={false}>
  <App />
</FiltersProvider>
```

### `useFilters` Hook

Access filter state and actions.

**Returns:**

```typescript
{
state: Record<string, FilterValue>, // Current filter values
set: (key: string, value: any) => void, // Update a filter
reset: () => void, // Reset all filters
isLoading: boolean, // Loading state
isInitialized: boolean, // Initialization complete
config: FilterConfig[] // Filter configuration
}
```

**Example:**

```javascript
const { state, set, reset, isLoading } = useFilters();

// Update a filter
set("country", { id: 1, label: "USA" });

// Reset all filters
reset();

// Check loading state
if (isLoading) {
  console.log("Filters are updating...");
}
```

### `useFilterOptions` Hook

Fetch filter options dynamically (useful for custom components).

**Parameters:**

```typescript
useFilterOptions(
config: FilterConfig[],
filterName: string,
parentValues?: any[][],
extraDeps?: any[],
opts?: { debounceMs?: number }
)
```

**Returns:**

```typescript
{
options: any[], // Fetched options
loading: boolean // Loading state
}
```

**Example:**

```javascript
import { useFilters, useFilterOptions } from "filtersprovider";

function CustomFilter() {
  const { state, config } = useFilters();

  const { options, loading } = useFilterOptions(
    config,
    "region",
    [state.country], // Parent values
    [], // Extra dependencies
    { debounceMs: 300 }
  );

  return (
    <div>{loading ? "Loading..." : `\${options.length} regions available`}</div>
  );
}
```

## Filter Configuration

### FilterConfig Object

```typescript
{
name: string; // Unique filter identifier
label: string; // Display label
isMulti: boolean; // Single or multi-select
defaultValue: object; // Default value { id: -1, label: "All" }
dependsOn?: string[]; // Parent filter dependencies
useBackend?: boolean; // Flag for fetcher to use backend
fetcher?: (params) => Promise<any[]>; // Function to fetch options
}
```

### Fetcher Function

The `fetcher` function receives:

```typescript
{
parentValues: any[][]; // Array of parent filter values
useBackend?: boolean; // Backend flag from config
extraDeps?: any[]; // Additional dependencies
}
```

**Example:**

```javascript
fetcher: async ({ parentValues, useBackend }) => {
  const [countryValues] = parentValues;
  const countryIds = countryValues.map((c) => c.id).filter((id) => id !== -1);

  if (countryIds.length === 0) {
    return [{ id: -1, label: "Select a country first" }];
  }

  const url = useBackend
    ? `/api/regions?countries=\${countryIds.join(",")}`
    : `/mock/regions?countries=\${countryIds.join(",")}`;

  const response = await fetch(url);
  return response.json();
};
```

## Available Filter Components

### `FilterSelect`

Standard MUI Select dropdown (single-select).

```javascript
<FilterSelect filterName="country" />
```

### `FilterMultiSelect`

Standard MUI Select dropdown (multi-select).

```javascript
<FilterMultiSelect filterName="region" />
```

### `FilterAutoCompleteSelect`

MUI Autocomplete with search (single-select).

```javascript
<FilterAutoCompleteSelect filterName="country" />
```

### `FilterAutoCompleteMultiSelect`

MUI Autocomplete with search (multi-select).

```javascript
<FilterAutoCompleteMultiSelect filterName="region" />
```

### `FilterSelectVirtualized`

Virtualized Select for large option lists (single-select).

```javascript
<FilterSelectVirtualized filterName="country" />
```

### `FilterMultiSelectVirtualized`

Virtualized Select for large option lists (multi-select).

```javascript
<FilterMultiSelectVirtualized filterName="city" />
```

### `FilterAutoCompleteSelectVirtualized`

Virtualized Autocomplete (single-select).

```javascript
<FilterAutoCompleteSelectVirtualized filterName="country" />
```

### `FilterAutoCompleteMultiSelectVirtualized`

Virtualized Autocomplete (multi-select).

```javascript
<FilterAutoCompleteMultiSelectVirtualized filterName="city" />
```

### `SelectAuto`

Automatically renders the appropriate component based on the filter configuration provided to `FiltersProvider`. Detects whether the filter is single/multi-select and whether virtualization is needed based on the config's `isMulti` property and option count.

```javascript
<SelectAuto filterName="region" />
```

The component will automatically choose:

- `FilterSelect` or `FilterMultiSelect` for standard lists
- `FilterSelectVirtualized` or `FilterMultiSelectVirtualized` for large lists
- Based on the `isMulti` property in your filter config

## Debug Components

### `FilterOptionsCountDisplay`

Display filter option counts for debugging.

```javascript
import { FilterOptionsCountDisplay } from "filtersprovider/debuggers";

<FilterOptionsCountDisplay extraDeps={[]} />;
```

## URL Synchronization

Filters automatically sync with URL query parameters:

```

# Single filter

/dashboard?country=1

# Multiple filters

/dashboard?country=1&region=5,6,7&city=12

# Share URLs with pre-populated filters!

```

### Benefits:

- **Bookmarkable** - Users can bookmark filtered views
- **Shareable** - Share filtered dashboards via URL
- **Browser navigation** - Back/forward buttons work as expected
- **Deep linking** - Link directly to specific filter states

## Advanced Usage

### Custom Filter Components

```javascript
import { useFilters, useFilterOptions } from "filtersprovider";

function CustomRangeFilter({ filterName }) {
  const { state, set, config } = useFilters();
  const { options, loading } = useFilterOptions(config, filterName, [], []);

  const handleChange = (newValue) => {
    set(filterName, newValue);
  };

  return (
    <div>
      <label>{filterName}</label>
      {loading ? (
        <span>Loading...</span>
      ) : (
        <input
          type="range"
          min={options[0]?.id}
          max={options[options.length - 1]?.id}
          value={state[filterName]?.id}
          onChange={(e) =>
            handleChange({
              id: parseInt(e.target.value),
              label: `Value \${e.target.value}`,
            })
          }
        />
      )}
    </div>
  );
}
```

### Conditional Filters

```javascript
const filterConfig = [
  {
    name: "productType",
    label: "Product Type",
    isMulti: false,
    defaultValue: { id: -1, label: "All Types" },
    fetcher: async () => {
      return [
        { id: 1, label: "Electronics" },
        { id: 2, label: "Clothing" },
      ];
    },
  },
  {
    name: "brand",
    label: "Brand",
    isMulti: true,
    defaultValue: { id: -1, label: "All Brands" },
    dependsOn: ["productType"],
    fetcher: async ({ parentValues }) => {
      const [typeValues] = parentValues;
      const typeId = typeValues[0]?.id;

      // Return different brands based on product type
      if (typeId === 1) {
        return [
          { id: 101, label: "Apple" },
          { id: 102, label: "Samsung" },
        ];
      } else if (typeId === 2) {
        return [
          { id: 201, label: "Nike" },
          { id: 202, label: "Adidas" },
        ];
      }

      return [];
    },
  },
];
```

### Backend vs Mock Data

```javascript
const filterConfig = [
  {
    name: "country",
    label: "Country",
    isMulti: false,
    defaultValue: { id: -1, label: "All Countries" },
    useBackend: true, // Flag to use real backend
    fetcher: async ({ useBackend }) => {
      const url = useBackend
        ? "/api/countries" // Production endpoint
        : "/mock/countries"; // Development mock

      const response = await fetch(url);
      return response.json();
    },
  },
];

// Switch between backend and mock
<FiltersProvider
  config={filterConfig.map((f) => ({
    ...f,
    useBackend: process.env.NODE_ENV === "production",
  }))}
>
  <App />
</FiltersProvider>;
```

## Troubleshooting

### Filters not updating

- Check that `fetcher` returns data in correct format: `[{ id, label }, ...]`
- Verify `dependsOn` array matches parent filter names exactly
- Ensure parent filters are defined before dependent filters in config

### URL not syncing

- Verify `BrowserRouter` wraps `FiltersProvider`
- Check browser console for URL parameter format

### Performance issues with large lists

- Use virtualized components (`\*Virtualized` variants)
- Consider debouncing in fetcher functions
- Implement server-side pagination in your API

### TypeScript errors

- Install type definitions: `npm install @types/react @types/react-dom`
- Ensure peer dependencies match your project versions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Support

For issues and questions:

- GitHub Issues: [your-repo-url/issues]
- Documentation: [your-docs-url]

---

Made with ❤️ by Simke Nys
