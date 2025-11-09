import { Box, Typography } from "@mui/material";
import { FiltersProvider, useFilters } from "../context/FiltersProvider";
import ActiveFiltersBar from "../components/filters/ActiveFiltersBar";
import { filterConfig } from "../hooks/useFilterConfig";
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import FilterAutoCompleteSelect from "../components/filters/FilterAutoCompleteSelect";
import FilterAutoCompleteMultiSelect from "../components/filters/FilterAutoCompleteMultiSelect";
import FilterMultiSelect from "../components/filters/FilterMultiSelect";
import FilterSelectVirtualized from "../components/filters/FilterSelectVirtualized";

/**
 * Main Dashboard wrapper with FiltersProvider
 */
export default function DashboardExample() {
  return (
    <BrowserRouter>
      <FiltersProvider>
        <DashboardInner />
      </FiltersProvider>
    </BrowserRouter>
  );
}

/**
 * Inner dashboard component that consumes filters
 */
function DashboardInner() {
  const { state } = useFilters();

  // Example: trigger API call whenever filters change
  useEffect(() => {
    console.log("Fetch data with filters:", state);
    // Production: replace with actual API call here
  }, [state]);

  return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" fontWeight="bold">
        Dynamic Filter Dashboard
      </Typography>

      {/* -------------------- Filter selects -------------------- */}
      <Box display="flex" gap={2} flexWrap="wrap">
        {filterConfig.map((f) => {
          // Check if this filter should be hidden based on parent
          if (f.hide && f.dependsOn?.length) {
            const directParentKey = f.dependsOn[f.dependsOn.length - 1]; // immediate parent
            const parentValue = state[directParentKey];
            if (!parentValue || parentValue.id === -1) {
              return null; // hide this filter
            }
          }

          return (
            <Box key={f.name} width={250}>
              {f ? (
                f.isAutoComplete ? (
                  f.isMulti ? (
                    <FilterAutoCompleteMultiSelect name={f.name} />
                  ) : (
                    <FilterAutoCompleteSelect name={f.name} />
                  )
                ) : f.isMulti ? (
                  <FilterMultiSelect name={f.name} />
                ) : (
                  <FilterSelectVirtualized name={f.name} />
                )
              ) : null}
            </Box>
          );
        })}
      </Box>

      {/* -------------------- Active filters bar -------------------- */}
      <ActiveFiltersBar />

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
