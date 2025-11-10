import { Box, Typography } from "@mui/material";
import { FiltersProvider, useFilters } from "../context/FiltersProvider";
import ActiveFiltersBar from "../components/debuggers/ActiveFiltersBar";
import { filterConfig } from "../hooks/useFilterConfig";
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";
import FilterOptionsCountDisplay from "../components/debuggers/FilterOptionsCountDisplay";
import SelectAuto from "../components/SelectAuto";

/**
 * Main Dashboard wrapper with FiltersProvider
 */
export default function DashboardExample() {
  return (
    <BrowserRouter>
      <FiltersProvider config={filterConfig} resetDependencies={false}>
        <DashboardInner />
      </FiltersProvider>
    </BrowserRouter>
  );
}

/**
 * Inner dashboard component that consumes filters
 */
function DashboardInner() {
  const { state, isInitialized, isLoading } = useFilters();

  // Example: trigger API call whenever filters change
  useEffect(() => {
    if (isInitialized) {
      console.log("Fetch data with filters:", state);
      // Production: replace with actual API call here
    }
  }, [state, isInitialized]);

  return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" fontWeight="bold">
        Dynamic Filter Dashboard
      </Typography>

      <LoadingOverlay isLoading={isLoading} />

      {/* -------------------- Filter selects -------------------- */}
      <Box display="flex" gap={2} flexWrap="wrap">
        {filterConfig.map((f) => {
          return <SelectAuto key={f.name} filter={f} state={state} />;
        })}
      </Box>

      {/* -------------------- Active filters bar -------------------- */}
      <ActiveFiltersBar />
      <FilterOptionsCountDisplay />

      {/* -------------------- Debug: current filter state -------------------- */}
      <Box>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          Current Filter State:
        </Typography>
        <Box
          component="pre"
          sx={{
            bgcolor: "grey.100",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            fontSize: "0.875rem",
          }}
        >
          {JSON.stringify(state, null, 2)}
        </Box>
      </Box>
    </Box>
  );
}
