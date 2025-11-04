// components/DashboardExample.js
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { FiltersProvider, useFilters } from "../../context/FiltersProvider";
import { useFilterConfig } from "../../hooks/useFilterConfig";

import ActiveFiltersBar from "../filters/ActiveFiltersBar";
import FilterSelect from "../filters/FilterSelect";

/**
 * Main Dashboard wrapper
 */
export default function DashboardExample() {
  return (
    <FiltersProvider>
      <DashboardInner />
    </FiltersProvider>
  );
}

/**
 * Inner dashboard component that consumes filters
 */
function DashboardInner() {
  const { state } = useFilters();
  const filterConfig = useFilterConfig();

  // Example: trigger API fetch whenever filter state changes
  useEffect(() => {
    console.log("Fetch data with filters:", state);
  }, [state]);

  return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" fontWeight="bold">
        Filter Dashboard
      </Typography>

      {/* Render filters dynamically from config */}
      <Box display="flex" gap={2} flexWrap="wrap">
        {filterConfig.map((f) => (
          <Box key={f.name} width={250}>
            <FilterSelect name={f.name} />
          </Box>
        ))}
      </Box>

      {/* Active filters bar */}
      <ActiveFiltersBar />

      {/* Debug: show current filter state */}
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
