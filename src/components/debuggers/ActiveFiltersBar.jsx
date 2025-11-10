import { Box, Typography, Chip, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useFilters } from "../../context/FiltersProvider";

export default function ActiveFiltersBar() {
  const { state, reset } = useFilters();

  // Flatten active filters, handle multi-select arrays
  const active = Object.entries(state).flatMap(([k, v]) => {
    if (Array.isArray(v)) {
      // Only include selected items, ignore ALL_OPTION (id: -1)
      const validItems = v.filter((item) => item.id !== -1);
      return validItems.map((item) => ({ key: k, value: item }));
    } else if (v?.id !== -1) {
      return [{ key: k, value: v }];
    }
    return [];
  });

  if (!active.length) {
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
      {active.map(({ key, value }) => (
        <Chip
          key={`${key}-${value.id}`}
          label={`${key}: ${value.label} (ID: ${value.id})`}
          size="small"
        />
      ))}
      <IconButton onClick={reset} size="small" title="Reset all to 'All'">
        <ClearIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
