// components/filters/ActiveFiltersBar.js
import { Box, Typography, Chip, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useFilters } from "../../context/FiltersProvider";

export default function ActiveFiltersBar() {
  const { state, reset } = useFilters();
  const activeFilters = Object.entries(state).filter(([, v]) => v?.id !== -1);

  if (!activeFilters.length) {
    return (
      <Box py={1}>
        <Typography variant="body2" color="text.secondary">
          No filters applied (all set to "All")
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
      <Typography variant="body2" fontWeight="medium">
        Active Filters:
      </Typography>
      {activeFilters.map(([k, v]) => (
        <Chip key={k} label={`${k}: ${v.label} (ID: ${v.id})`} size="small" />
      ))}
      <IconButton onClick={reset} size="small" title="Reset all to 'All'">
        <ClearIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
