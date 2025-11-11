# FiltersProvider Library

A production-ready React filters library with URL synchronization, dependency management, and Material-UI components.

**NPM Package:** [https://www.npmjs.com/package/filtersprovider](https://www.npmjs.com/package/filtersprovider)

**GitHub Repository:** [https://github.com/simkenys/filters-demo](https://github.com/simkenys/filters-demo)

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
- [Debug Components](#debug-components)
- [URL Synchronization](#url-synchronization)
- [Advanced Usage](#advanced-usage)
  - [Reset Dependencies Behavior](#reset-dependencies-behavior)
  - [Using Extra Dependencies](#using-extra-dependencies)
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
- ✅ **Extra Dependencies** - Support for external context (user, date range, etc.)
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
    isAutoComplete: false,
    defaultValue: { id: -1, label: "All Countries" },
    fetcher: async ({ parentValues, extraDeps }) => {
      const response = await fetch("/api/countries");
      const data = await response.json();
      return [{ id: -1, label: "All Countries" }, ...data];
    },
  },
  {
    name: "region",
    label: "Region",
    isMulti: true,
    isAutoComplete: true,
    defaultValue: { id: -1, label: "All Regions" },
    dependsOn: ["country"],
    fetcher: async ({ parentValues, extraDeps }) => {
      const [countryValues] = parentValues;
      const countryIds = countryValues
        .map((c) => c.id)
        .filter((id) => id !== -1);

      if (countryIds.length === 0) {
        return [{ id: -1, label: "Select a country first" }];
      }

      const response = await fetch(
        `/api/regions?countryId=\${countryIds.join(",")}`
      );
      const data = await response.json();
      return [{ id: -1, label: "All Regions" }, ...data];
    },
  },
  {
    name: "city",
    label: "City",
    isMulti: true,
    isAutoComplete: true,
    defaultValue: { id: -1, label: "All Cities" },
    dependsOn: ["country", "region"],
    hide: true, // Hide until parent is selected
    fetcher: async ({ parentValues, extraDeps }) => {
      const [countryValues, regionValues] = parentValues;
      const regionIds = regionValues.map((r) => r.id).filter((id) => id !== -1);

      if (regionIds.length === 0) {
        return [{ id: -1, label: "Select a region first" }];
      }

      const response = await fetch(
        `/api/cities?regionId=\${regionIds.join(",")}`
      );
      const data = await response.json();
      return [{ id: -1, label: "All Cities" }, ...data];
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
import { SelectAuto } from "filtersprovider/filters";

export default function Dashboard() {
  const { state, isLoading } = useFilters();

  return (
    <div>
      <h1>Dashboard</h1>

      {/* SelectAuto automatically chooses the right component */}
      <SelectAuto filter={filterConfig[0]} state={state} />
      <SelectAuto filter={filterConfig[1]} state={state} />
      <SelectAuto filter={filterConfig[2]} state={state} />

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

| Prop                | Type             | Required | Default | Description                                                                                          |
| ------------------- | ---------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `config`            | `FilterConfig[]` | ✅       | -       | Array of filter configurations                                                                       |
| `resetDependencies` | `boolean`        | ❌       | `false` | Reset dependent filters when parent changes (see [Reset Dependencies](#reset-dependencies-behavior)) |
| `children`          | `ReactNode`      | ✅       | -       | Your app components                                                                                  |

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
  state: Record<string, FilterValue>,      // Current filter values
  set: (key: string, value: any) => void,  // Update a filter
  reset: () => void,                       // Reset all filters
  isLoading: boolean,                      // Loading state
  isInitialized: boolean,                  // Initialization complete
  config: FilterConfig[]                   // Filter configuration
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
  options: any[],    // Fetched options
  loading: boolean   // Loading state
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
  name: string;              // Unique filter identifier
  label: string;             // Display label
  isMulti: boolean;          // Single or multi-select
  isAutoComplete?: boolean;  // Use autocomplete component
  hide?: boolean;            // Hide until parent filter is selected
  defaultValue: object;      // Default value { id: -1, label: "All" }
  dependsOn?: string[];      // Parent filter dependencies
  useBackend?: boolean;      // Flag for fetcher to use backend
  fetcher?: (params) => Promise<any[]>;  // Function to fetch options
}
```

### Fetcher Function

The `fetcher` function receives:

```typescript
{
  parentValues: any[][];  // Array of parent filter values
  extraDeps?: any[];      // Additional dependencies (user, date, etc.)
}
```

**Important:** The library's utility functions **automatically prepend the "All" option**. You only need to manually add it if writing completely custom fetchers.

```javascript
import { ALL_OPTION } from "filtersprovider";

// ALL_OPTION is defined as: { id: -1, label: "All" }
```

### Helper Functions

The library provides utility functions that handle all common fetching patterns. **All utilities automatically manage the "All" option for you.**

#### `fetchFromBackend`

Handles backend API calls with automatic parent value parsing.

```javascript
import { fetchFromBackend, ALL_OPTION } from "filtersprovider";

const filterConfig = [
  {
    name: "region",
    label: "Region",
    isMulti: true,
    defaultValue: ALL_OPTION,
    dependsOn: ["country"],
    fetcher: async ({ parentValues }) => {
      return fetchFromBackend({
        parentValues,
        filterProps: { dependsOn: ["country"] },
        endpoint: "/api/regions",
      });
      // Automatically returns: [ALL_OPTION, ...apiData]
    },
  },
];
```

**What it does:**

- Flattens parent values and filters out "All" selections (`id: -1`)
- Builds query parameters from parent IDs (e.g., `?countryId=1&countryId=2`)
- Fetches from the endpoint
- **Automatically prepends `ALL_OPTION`**
- Returns: `[{ id: -1, label: "All" }, ...data]`

**Example API call generated:**

```
GET /api/regions?countryId=1&countryId=5
```

#### `fetchByFilter` + `filterFakeData`

For development and testing with mock data. Perfect for prototyping without a backend.

```javascript
import { fetchByFilter, ALL_OPTION } from "filtersprovider";

const mockRegions = [
  { id: 1, label: "California", countryId: 1 },
  { id: 2, label: "Texas", countryId: 1 },
  { id: 3, label: "Ontario", countryId: 2 },
  { id: 4, label: "Quebec", countryId: 2 },
];

const filterConfig = [
  {
    name: "region",
    label: "Region",
    isMulti: true,
    defaultValue: ALL_OPTION,
    dependsOn: ["country"],
    fetcher: async ({ parentValues }) => {
      return fetchByFilter({
        parentValues,
        data: mockRegions,
        filterProps: { dependsOn: ["country"] },
      });
      // Automatically returns: [ALL_OPTION, ...filtered]
    },
  },
];
```

**What it does:**

- Uses `flattenWithDependsOn` to map parent values to filter keys
- Filters fake data based on parent selections
- If country with `id=1` is selected, returns California and Texas
- **Automatically prepends `ALL_OPTION`**
- Returns: `[{ id: -1, label: "All" }, { id: 1, label: "California" }, { id: 2, label: "Texas" }]`

**Key matching convention:**
The utility expects your mock data to have parent keys formatted as `{parentName}Id`:

```javascript
// If dependsOn: ["country", "region"]
// Mock data should have: countryId, regionId
{
  id: 1,
  label: "Los Angeles",
  countryId: 1,    // Matches "country"
  regionId: 1      // Matches "region"
}
```

### Custom Fetcher (Manual Approach)

Only needed if you have highly custom logic not covered by the utilities:

```javascript
import { ALL_OPTION } from "filtersprovider";

const filterConfig = [
  {
    name: "region",
    label: "Region",
    isMulti: true,
    defaultValue: ALL_OPTION,
    dependsOn: ["country"],
    fetcher: async ({ parentValues, extraDeps }) => {
      const [countryValues] = parentValues;
      const countryIds = countryValues
        .map((c) => c.id)
        .filter((id) => id !== -1);

      if (countryIds.length === 0) {
        return [ALL_OPTION]; // No parent selected
      }

      // Custom logic here...
      const response = await fetch(`/api/custom-endpoint?ids=\${countryIds}`);
      const data = await response.json();

      // Manually prepend ALL_OPTION for custom fetchers
      return [ALL_OPTION, ...data];
    },
  },
];
```

### Utility Summary

| Function           | Use Case                   | ALL_OPTION   | Parent Filtering |
| ------------------ | -------------------------- | ------------ | ---------------- |
| `fetchFromBackend` | Real API calls             | ✅ Automatic | ✅ Query params  |
| `fetchByFilter`    | Mock/fake data             | ✅ Automatic | ✅ Filters array |
| `filterFakeData`   | Direct fake data filtering | ✅ Automatic | ✅ Filters array |
| Custom fetcher     | Special cases              | ❌ Manual    | Custom logic     |

**Recommendation:** Use `fetchFromBackend` for production and `fetchByFilter` for development. This covers 99% of use cases without writing custom code.

### Switching Between Mock and Real Data

```javascript
import { fetchFromBackend, fetchByFilter, ALL_OPTION } from "filtersprovider";

const mockRegions = [
  { id: 1, label: "California", countryId: 1 },
  { id: 2, label: "Texas", countryId: 1 },
];

const filterConfig = [
  {
    name: "region",
    label: "Region",
    isMulti: true,
    defaultValue: ALL_OPTION,
    dependsOn: ["country"],
    useBackend: process.env.NODE_ENV === "production",
    fetcher: async ({ parentValues, useBackend }) => {
      if (useBackend) {
        return fetchFromBackend({
          parentValues,
          filterProps: { dependsOn: ["country"] },
          endpoint: "/api/regions",
        });
      } else {
        return fetchByFilter({
          parentValues,
          data: mockRegions,
          filterProps: { dependsOn: ["country"] },
        });
      }
    },
  },
];
```

...

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

Automatically renders the appropriate component based on the filter configuration:

- Checks `isAutoComplete` to decide between Select or Autocomplete
- Checks `isMulti` to decide between single or multi-select
- Always uses virtualized variants for performance
- Supports `hide` property to conditionally show/hide based on parent selection

```javascript
import { SelectAuto } from "filtersprovider/filters";
import { useFilters } from "filtersprovider";
import { filterConfig } from "./filterConfig";

function MyFilters() {
  const { state } = useFilters();

  return (
    <div>
      {filterConfig.map((filter) => (
        <SelectAuto key={filter.name} filter={filter} state={state} />
      ))}
    </div>
  );
}
```

The component will automatically choose:

- `FilterSelectVirtualized` - if `isAutoComplete: false` and `isMulti: false`
- `FilterMultiSelectVirtualized` - if `isAutoComplete: false` and `isMulti: true`
- `FilterAutoCompleteSelectVirtualized` - if `isAutoComplete: true` and `isMulti: false`
- `FilterAutoCompleteMultiSelectVirtualized` - if `isAutoComplete: true` and `isMulti: true`

If `hide: true` is set in the config, the filter will be hidden until its immediate parent has a valid selection (not `id: -1`).

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

### Reset Dependencies Behavior

The `resetDependencies` prop on `FiltersProvider` controls what happens to dependent filters when their parent changes.

#### `resetDependencies={false}` (Default - Recommended)

**Behavior:** When a parent filter changes, child filters retain their current selections IF they're still valid in the new options. Invalid selections are removed.

**Example:**

```javascript
// User selects: Country = "USA", Regions = ["California", "Texas"]
// User changes Country to "Canada"
// Result: Regions gets cleared (because CA and TX aren't in Canada)

// But if user selects: Country = "North America", Regions = ["California", "Texas"]
// And "North America" includes both USA and Canada regions
// User changes to more filters but California and Texas are still valid
// Result: Regions keeps ["California", "Texas"]
```

**Use when:** You want to preserve user selections when possible (better UX).

```javascript
<FiltersProvider config={filterConfig} resetDependencies={false}>
  <App />
</FiltersProvider>
```

#### `resetDependencies={true}`

**Behavior:** When a parent filter changes, ALL dependent filters immediately reset to their default values, regardless of whether selections are still valid.

**Example:**

```javascript
// User selects: Country = "USA", Regions = ["California", "Texas"]
// User changes Country to "Canada"
// Result: Regions resets to [{ id: -1, label: "All Regions" }]

// Even if the regions were still valid, they get cleared
```

**Use when:**

- You want predictable, consistent behavior
- Your filters have complex dependencies where partial selections don't make sense
- You prefer users start fresh when changing parent filters

```javascript
<FiltersProvider config={filterConfig} resetDependencies={true}>
  <App />
</FiltersProvider>
```

#### Summary

| `resetDependencies` | Behavior                          | Best For                      |
| ------------------- | --------------------------------- | ----------------------------- |
| `false` (default)   | Smart - keeps valid selections    | Better UX, flexible workflows |
| `true`              | Strict - always resets to default | Predictable, simple workflows |

### Using Extra Dependencies

The `extraDeps` parameter in `useFilterOptions` allows filter options to depend on values outside the filter hierarchy, such as:

- Current user ID
- Selected date range
- Application mode or context
- Any other external state

This is useful when the available options should change based on context beyond parent filters.

**Example: User-specific regions**

```javascript
import { useFilters, useFilterOptions } from "filtersprovider";

function RegionFilter({ currentUserId, dateRange }) {
  const { state, config } = useFilters();

  // Options depend on both parent filters AND external values
  const { options, loading } = useFilterOptions(
    config,
    "region",
    [state.country], // Parent filter values
    [currentUserId, dateRange], // Extra dependencies
    { debounceMs: 100 }
  );

  // Options will refetch when country, userId, OR dateRange changes

  return (
    <div>
      {loading ? "Loading regions..." : `\${options.length} regions available`}
    </div>
  );
}
```

**In your filter config:**

```javascript
{
  name: "region",
  label: "Region",
  isMulti: true,
  defaultValue: { id: -1, label: "All Regions" },
  dependsOn: ["country"],
  fetcher: async ({ parentValues, extraDeps }) => {
    const [countryValues] = parentValues;
    const [userId, dateRange] = extraDeps;

    const countryIds = countryValues.map(c => c.id).filter(id => id !== -1);

    if (countryIds.length === 0) {
      return [{ id: -1, label: "Select a country first" }];
    }

    // Include extraDeps in your API call
    const params = new URLSearchParams();
    countryIds.forEach(id => params.append('countryId', id));
    if (userId) params.append('userId', userId);
    if (dateRange) {
      params.append('startDate', dateRange.start);
      params.append('endDate', dateRange.end);
    }

    const response = await fetch(`/api/regions?\${params}`);
    const data = await response.json();

    return [{ id: -1, label: "All Regions" }, ...data];
  },
}
```

**Common use cases:**

- **User permissions:** Show only regions the user has access to
- **Time-based filtering:** Show only active regions during a date range
- **Context-aware options:** Show different options based on app mode
- **Search/filter parameters:** Filter options based on search input

**Important:** The `extraDeps` array is JSON-stringified for comparison, so changes will trigger refetches. Make sure values are serializable.

### Custom Filter Components

You can build custom filter UIs using the library's hooks:

```javascript
import { useFilters, useFilterOptions, ALL_OPTION } from "filtersprovider";

function CustomSliderFilter({ filterName }) {
  const { state, set, config } = useFilters();
  const { options, loading } = useFilterOptions(config, filterName, [], []);

  if (loading || options.length === 0) {
    return <span>Loading...</span>;
  }

  // Filter out the ALL_OPTION (id: -1) for the slider
  const validOptions = options.filter((opt) => opt.id !== ALL_OPTION.id);

  if (validOptions.length === 0) {
    return <span>No options available</span>;
  }

  const currentValue = state[filterName];
  const currentId =
    currentValue?.id !== ALL_OPTION.id ? currentValue?.id : validOptions[0]?.id;

  const handleChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedOption = validOptions.find((opt) => opt.id === selectedId);
    set(filterName, selectedOption);
  };

  return (
    <div>
      <label>
        {filterName}: {validOptions.find((o) => o.id === currentId)?.label}
      </label>
      <input
        type="range"
        min={validOptions[0]?.id}
        max={validOptions[validOptions.length - 1]?.id}
        step="1"
        value={currentId}
        onChange={handleChange}
      />
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
    isAutoComplete: false,
    defaultValue: { id: -1, label: "All Types" },
    fetcher: async () => {
      return [
        { id: -1, label: "All Types" },
        { id: 1, label: "Electronics" },
        { id: 2, label: "Clothing" },
      ];
    },
  },
  {
    name: "brand",
    label: "Brand",
    isMulti: true,
    isAutoComplete: true,
    defaultValue: { id: -1, label: "All Brands" },
    dependsOn: ["productType"],
    fetcher: async ({ parentValues }) => {
      const [typeValues] = parentValues;
      const typeId = typeValues[0]?.id;

      // Return different brands based on product type
      if (typeId === 1) {
        return [
          { id: -1, label: "All Brands" },
          { id: 101, label: "Apple" },
          { id: 102, label: "Samsung" },
        ];
      } else if (typeId === 2) {
        return [
          { id: -1, label: "All Brands" },
          { id: 201, label: "Nike" },
          { id: 202, label: "Adidas" },
        ];
      }

      return [{ id: -1, label: "Select a product type first" }];
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
    isAutoComplete: false,
    defaultValue: { id: -1, label: "All Countries" },
    useBackend: true, // Flag to use real backend
    fetcher: async ({ useBackend }) => {
      const url = useBackend
        ? "/api/countries" // Production endpoint
        : "/mock/countries"; // Development mock

      const response = await fetch(url);
      const data = await response.json();

      return [{ id: -1, label: "All Countries" }, ...data];
    },
  },
];

// Switch between backend and mock globally
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

- Check that `fetcher` returns data in correct format: `[{ id: -1, label: "All" }, { id, label }, ...]`
- **Always include the "All" option as the first element**
- Verify `dependsOn` array matches parent filter names exactly
- Ensure parent filters are defined before dependent filters in config

### URL not syncing

- Verify `BrowserRouter` wraps `FiltersProvider`
- Check browser console for URL parameter format
- Ensure filter names in URL match config names

### Performance issues with large lists

- Use virtualized components (`*Virtualized` variants)
- Use `SelectAuto` which automatically uses virtualized components
- Consider debouncing in fetcher functions
- Implement server-side pagination in your API

### "All" option not appearing

- Make sure your `fetcher` prepends the "All" option: `[{ id: -1, label: "All" }, ...data]`
- The library expects `id: -1` to represent "All" selections

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

Contributions welcome! Please open an issue or submit a pull request on GitHub.

## Support

For issues and questions:

- **GitHub Issues:** [https://github.com/simkenys/filters-demo/issues](https://github.com/simkenys/filters-demo/issues)
- **NPM Package:** [https://www.npmjs.com/package/filtersprovider](https://www.npmjs.com/package/filtersprovider)

---

Made with ❤️ by Simke Nys
