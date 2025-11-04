**Key Features**

- **Dynamic filter configuration**

  - All filters are defined in filterConfig.
  - Each filter includes: name, label, defaultValue, dependsOn, and fetcher.

- **Multi-level dependencies**

  - Changing a parent filter validates all child filters recursively.
  - Child filters reset only if their selection is invalid based on current parent values.

- **Debounced validation**

  - Filter values are checked against available options with configurable debounce.
  - Prevents flickering or unnecessary resets on rapid user changes.

- **URL Synchronization**

  - Filters automatically update the URL query parameters.
  - Initial load reads the URL to populate filter state.
  - Supports bookmarking and sharing the dashboard with selected filters.

- **Flexible data fetching**

  - useFilterOptions handles all fetch logic.
  - Compatible with:
    - Fake fetchers for development
    - SWR or custom API fetchers for production

- **Router Integration**
  - DashboardExample is wrapped in BrowserRouter to enable URL syncing via useSearchParams.
