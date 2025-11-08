**Key Features**

- **Dynamic filter configuration**

  - All filters are defined in filterConfig.

- **Multi-level dependencies**

  - Changing a parent filter validates all child filters recursively.
  - Child filters reset:
    - only if their selection is invalid based on current parent values. (in useFilterConfig resetDependencies = false)
    - always when a parent filter changes. (in useFilterConfig resetDependencies = true)

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
  - Fetchers are configured in fetchers.js (In useFilterConfig.jsx, you can put useBackend: true on each filter to use the API version. False will use local FAKE data)

- **Router Integration**
  - DashboardExample is wrapped in BrowserRouter to enable URL syncing via useSearchParams.

## Start Local JSON Server (when useBackend: true in your filterConfig)

1. Make sure dependencies are installed (json-server cors):

```
npm install
```

2. Start the local API server:

```
npm run api:dev
```

3. The API will be available at: `http://localhost:4000`

The server uses `db.json` as the data source. You can edit `db.json` to change or add data, and `server.js` is the entry point that configures `json-server` and any custom routes/middleware (inclusive CORS).

**Next Todos**

- Add autocomplete single-select
- Add autocomplete multi-select
