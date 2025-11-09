# Filter System

A flexible, URL-synchronized filter system with multi-level dependencies and automatic validation cascading. Built for React applications that require complex hierarchical filtering with proper state management and URL persistence.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Start Local JSON Server](#start-local-json-server)
  - [Start Example Project](#start-example-project)
- [Key Features](#key-features)
  - [Dynamic Filter Configuration](#dynamic-filter-configuration)
  - [Multi-Level Dependencies](#multi-level-dependencies)
  - [Immediate Validation and Cascade](#immediate-validation-and-cascade)
  - [URL Synchronization](#url-synchronization)
  - [Flexible Data Fetching](#flexible-data-fetching)
  - [Router Integration](#router-integration)
- [Filter Configuration Overview](#filter-configuration-overview)
  - [Example Filter Definition](#example-filter-definition)
  - [Configuration Properties](#configuration-properties)
  - [Global Setting: resetDependencies](#global-setting-resetdependencies)
  - [Example Filter Configuration](#example-filter-configuration)
- [Architecture Overview](#architecture-overview)
  - [Core Components](#core-components)
  - [Data Flow](#data-flow)
  - [Cache Behavior](#cache-behavior)
- [Usage Example](#usage-example)
- [Troubleshooting](#troubleshooting)
  - [Duplicate Network Requests in Development](#duplicate-network-requests-in-development)
  - [Filters Not Resetting](#filters-not-resetting)
  - [URL Not Syncing](#url-not-syncing)
- [Customization](#customization)
  - [Adjust Cache Duration](#adjust-cache-duration)
  - [Change Reset Behavior](#change-reset-behavior)
  - [Add Custom Validation](#add-custom-validation)
- [Next Steps / Roadmap](#next-steps--roadmap)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js installed (v16 or higher recommended)
- npm or yarn package manager

### Installation

Install all required dependencies:

```bash
npm install
```

This includes:

- React and React Router for UI and routing
- json-server and cors for local API development
- All other project dependencies

### Start Local JSON Server

**(Required when `useBackend: true` in your filterConfig)**

Start the local API server:

```bash
npm run api:dev
```

The API will be available at `http://localhost:4000`

The server uses `db.json` as the data source. You can edit `db.json` to change or add data. The `server.js` file is the entry point that configures `json-server` with custom routes and middleware (including CORS support).

### Start Example Project

Run the development server:

```bash
npm run dev
```

The application will start and open in your browser, typically at `http://localhost:5173`

## Key Features

### Dynamic Filter Configuration

- All filters are defined in a single `filterConfig` array
- Each filter specifies its dependencies, fetcher, and behavior
- Easy to add, remove, or modify filters without touching component code

### Multi-Level Dependencies

- Changing a parent filter automatically validates all child filters recursively
- Child filters reset behavior is configurable via `resetDependencies` setting:
  - `false`: Child filters keep their selection if it's still valid for the new parent values
  - `true`: Child filters always reset when a parent filter changes

### Immediate Validation and Cascade

- Filter values are validated against available options
- Sequential processing ensures children always use correct parent values
- **Configurable debounce** prevents excessive fetching during rapid filter changes (default: 100ms)
- In-memory cache prevents duplicate network requests for identical parameters (5-minute TTL, configurable)
- Handles React StrictMode double-invokes gracefully

### URL Synchronization

- Filters automatically update URL query parameters on change
- Initial load reads the URL to populate filter state
- Supports bookmarking and sharing with selected filters
- URL is the single source of truth on page load

### Flexible Data Fetching

- `useFilterOptions` hook handles all fetch logic
- Compatible with multiple data sources:
  - Fake data for development (local FAKE\_\* data)
  - Custom API fetchers for production
- Toggle between sources via `useBackend` flag in `useFilterConfig.jsx`:
  - `useBackend: true` → Fetch from API
  - `useBackend: false` → Use local FAKE\_\* data

### Router Integration

- Built on React Router for seamless URL management
- Uses `useSearchParams` for query parameter handling
- Example wrapped in `BrowserRouter` for full functionality

## Filter Configuration Overview

Each filter in the system is defined in `filterConfig`, which describes how filters are displayed and how they depend on each other.

### Example Filter Definition

```javascript
{
  name: "region",                       // Unique key used internally
  label: "Region",                      // Display label for the UI
  defaultValue: ALL_OPTION,             // Initial value when no selection
  dependsOn: ["continent", "country"],  // Parent filters this one listens to
  fetcher: fetchRegion,                 // Async function to load available options
  isMulti: true,                        // Allows multi-selection (optional)
  useBackend: true,                     // true = API, false = FAKE_* data
}
```

### Configuration Properties

| Property       | Type     | Required | Description                                        |
| -------------- | -------- | -------- | -------------------------------------------------- |
| `name`         | string   | Yes      | Unique identifier for the filter                   |
| `label`        | string   | Yes      | Display label shown in the UI                      |
| `defaultValue` | object   | Yes      | Initial value (typically `ALL_OPTION`)             |
| `dependsOn`    | array    | No       | List of parent filter names this filter depends on |
| `fetcher`      | function | Yes      | Async function that returns available options      |
| `isMulti`      | boolean  | No       | Enable multi-select mode (default: false)          |
| `useBackend`   | boolean  | No       | Use API (true) or fake data (false)                |

### Global Setting: resetDependencies

Located in `useFilterConfig.jsx`:

```javascript
export const resetDependencies = false;
```

**Behavior:**

- **`true`** → When a parent filter changes (e.g., Continent → Europe), all child filters reset automatically to their default values
- **`false`** → Child filters keep their current selection if the selected value is still valid for the new parent values

This makes it easy to control whether child filters should "remember" previous selections or always reset on parent changes.

### Example Filter Configuration

```javascript
export const filterConfig = [
  {
    name: "continent",
    label: "Continent",
    defaultValue: ALL_OPTION,
    dependsOn: [],
    fetcher: fetchContinent,
    useBackend: true,
  },
  {
    name: "country",
    label: "Country",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent"],
    fetcher: fetchCountry,
    isMulti: true,
    useBackend: true,
  },
  {
    name: "region",
    label: "Region",
    defaultValue: ALL_OPTION,
    dependsOn: ["continent", "country"],
    fetcher: fetchRegion,
    isMulti: true,
    useBackend: true,
  },
  // ... more filters
];
```

## Architecture Overview

### Core Components

**FiltersProvider** (`FiltersProvider.jsx`)

- Central state management for all filters
- Handles filter updates and dependency cascading
- Manages URL synchronization
- Processes children sequentially to prevent race conditions

**Filter Configuration** (`useFilterConfig.jsx`)

- Defines all available filters and their relationships
- Configures global behavior (`resetDependencies`)
- Single source of truth for filter metadata

**Fetchers** (`fetchers.js`)

- Implements data fetching with deduplication
- In-memory cache with configurable TTL (default: 5 minutes)
- Handles both API and fake data sources
- Prevents duplicate network requests

**useFilterOptions Hook** (`useFilterOptions.jsx`)

- Fetches filter options with debouncing (default: 100ms)
- Cancels in-flight requests when dependencies change
- Provides loading states for UI feedback
- Accepts optional extra dependencies for complex scenarios (like a user id)

### Data Flow

1. User changes a filter → `setFilter` is called
2. Parent filter value is updated
3. All dependent children are collected recursively
4. Children are processed **sequentially** in dependency order:
   - Fetch new options based on updated parent values
   - Validate current selection against new options
   - Reset to default if invalid (or if `resetDependencies: true`)
5. All state updates batched and dispatched together
6. URL parameters updated to reflect new state

### Cache Behavior

- Concurrent requests with identical parameters share the same promise (deduplication)
- Completed requests are cached for 5 minutes (configurable)
- Cache survives filter changes - going back to previous selections uses cached data
- Cache is cleared on page refresh

## Usage Example

```javascript
import { FiltersProvider, useFilters } from "./context/FiltersProvider";
import { useFilterOptions } from "./hooks/useFilterOptions";

function MyFilterComponent() {
  const { state, set } = useFilters();

  // Fetch options with debouncing
  const { options, loading } = useFilterOptions(
    "country",
    [[state.continent]], // Parent values
    [],
    { debounceMs: 100 }
  );

  const handleChange = (newValue) => {
    set("country", newValue);
  };

  return (
    <select
      value={state.country.id}
      onChange={(e) =>
        handleChange({
          id: e.target.value,
          label: e.target.options[e.target.selectedIndex].text,
        })
      }
      disabled={loading}
    >
      {loading ? (
        <option>Loading...</option>
      ) : (
        options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))
      )}
    </select>
  );
}
```

## Troubleshooting

### Duplicate Network Requests in Development

If you see duplicate network requests in development:

- This is caused by React StrictMode, which intentionally double-invokes functions
- The cache system prevents actual duplicate fetches (both calls share the same promise)
- This behavior only happens in development and will not occur in production

### Filters Not Resetting

If child filters aren't resetting when parents change:

- Check `resetDependencies` setting in `useFilterConfig.jsx`
- Verify the `dependsOn` array is correctly defined for each filter
- Ensure fetchers are returning valid data structures

### URL Not Syncing

- Verify `BrowserRouter` wraps your `FiltersProvider`
- Check that filters have unique `name` properties
- Ensure you're using `useSearchParams` from `react-router-dom`

## Customization

### Adjust Cache Duration

In `fetchers.js`:

```javascript
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
// or
const CACHE_DURATION = Infinity; // Never expires (until page refresh)
```

### Change Reset Behavior

In `useFilterConfig.jsx`:

```javascript
export const resetDependencies = true; // Always reset children
```

### Add Custom Validation

Modify the validation logic in `FiltersProvider.jsx` within the `setFilter` function to add custom rules for specific filters.

### Adjust Debounce Duration

The `useFilterOptions` hook accepts a `debounceMs` option:

```javascript
const { options, loading } = useFilterOptions(
  "region",
  parentValues,
  [],
  { debounceMs: 300 } // Wait 300ms before fetching
);
```

**Default:** 100ms
**Use cases:**

- Increase for search/autocomplete inputs (e.g., 300-500ms)
- Decrease for instant feedback (e.g., 0ms)
- Keep default (100ms) for standard dropdowns

### Using Extra Dependencies

The `useFilterOptions` hook accepts an `extraDeps` parameter for scenarios where options depend on values outside the filter hierarchy (e.g., current user, date range, or other context).

```javascript
function MyFilterComponent({ currentUserId, dateRange }) {
  const { state } = useFilters();

  // Options depend on parent filters AND external values
  const { options, loading } = useFilterOptions(
    "region",
    [[state.continent], [state.country]],
    [currentUserId, dateRange], // Extra dependencies
    { debounceMs: 100 }
  );

  // Options will refetch when continent, country, userId, or dateRange changes
}
```

**Common use cases:**

- **User-specific data:** Filter options based on current user's permissions or preferences
- **Time-based filtering:** Options change based on selected date range
- **Feature flags:** Show/hide options based on enabled features
- **External state:** Options depend on Redux store, URL params, or other context

**Note:** Extra dependencies are serialized via `JSON.stringify`, so only use primitive values or simple objects.

## Next Steps / Roadmap

- [ ] Add autocomplete single-select component
- [ ] Add autocomplete multi-select component
- [ ] Add filter presets/saved views
- [ ] Add loading states for filter options
- [ ] Implement optimistic updates
