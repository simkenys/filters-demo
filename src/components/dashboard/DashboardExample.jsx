import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { FiltersProvider, useFilters } from "../../context/FiltersContext";
import FilterSelect from "../filters/FilterSelect";
import ActiveFiltersBar from "../filters/ActiveFiltersBar";

/**
 * Main dashboard wrapper
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

  // Example: trigger data fetch whenever filters change
  useEffect(() => {
    console.log("Fetch data with filters:", state);
    // In prod, this is where you'd call your API with the selected filters
  }, [state]);

  return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" fontWeight="bold">
        Filter Dashboard
      </Typography>

      {/* --------------------
          Filter selects
          -------------------- */}
      <Box display="flex" gap={2} flexWrap="wrap">
        <Box width={250}>
          <FilterSelect name="country" label="Country" />
        </Box>
        <Box width={250}>
          <FilterSelect name="city" label="City" dependsOn={["country"]} />
        </Box>
        <Box width={250}>
          <FilterSelect
            name="store"
            label="Store"
            dependsOn={["country", "city"]}
          />
        </Box>
      </Box>

      {/* --------------------
          Active filters bar
          -------------------- */}
      <ActiveFiltersBar />

      {/* --------------------
          Debug: show current filter state
          -------------------- */}
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
