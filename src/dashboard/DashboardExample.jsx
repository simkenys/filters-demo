// src/pages/DashboardExample.js
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { FiltersProvider, useFilters } from "../context/FiltersProvider";
import FilterSelect from "../components/filters/FilterSelect";
import ActiveFiltersBar from "../components/filters/ActiveFiltersBar";
import { useFilterConfig } from "../hooks/useFilterconfig";

export default function DashboardExample() {
  return (
    <FiltersProvider>
      <DashboardInner />
    </FiltersProvider>
  );
}

function DashboardInner() {
  const { state } = useFilters();
  const cfg = useFilterConfig();

  useEffect(() => {
    // production: your data fetch should use the filter state
    console.log("Fetch data with filters:", state);
  }, [state]);

  return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" fontWeight="bold">
        Production-ready Dynamic Filters (20)
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap">
        {cfg.map((f) => (
          <Box key={f.name} width={250}>
            <FilterSelect name={f.name} debounceMs={200} extraDeps={[]} />
          </Box>
        ))}
      </Box>

      <ActiveFiltersBar />

      <Box
        component="pre"
        sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, overflow: "auto" }}
      >
        {JSON.stringify(state, null, 2)}
      </Box>
    </Box>
  );
}
