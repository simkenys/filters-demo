import { Box, Typography } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { filterConfig } from "../config/filterConfig.js";
import { useEffect } from "react";
import {
  ActiveFiltersBar,
  FilterOptionsCountDisplay,
  FiltersProvider,
  LoadingOverlay,
  SelectAuto,
  useFilters,
} from "filtersprovider";

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
            bgcolor: "background.paper",
            color: "text.primary",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            fontSize: "0.875rem",
            border: 1,
            borderColor: "divider",
          }}
        >
          {JSON.stringify(state, null, 2)}
        </Box>
      </Box>
    </Box>
  );
}
