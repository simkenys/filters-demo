import { useMemo } from "react";
import { useFilters } from "../../context/FiltersProvider";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { Box, Typography, Paper, Stack, CircularProgress } from "@mui/material";

export default function FilterOptionsCountDisplay({ extraDeps = [] }) {
  const { state, config } = useFilters();

  return (
    <Paper
      sx={{
        p: 2,
        mt: 2,
        borderRadius: 2,
        lineHeight: 1.6,
        fontFamily: "monospace",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : theme.palette.grey[100],
      }}
    >
      <Typography variant="h6" gutterBottom>
        🔍 Filter Options Debugger
      </Typography>

      <Stack spacing={1}>
        {config.map((conf) => (
          <FilterOptionsCount
            key={conf.name}
            conf={conf}
            config={config}
            state={state}
            extraDeps={extraDeps}
          />
        ))}
      </Stack>
    </Paper>
  );
}

function FilterOptionsCount({ conf, config, state, extraDeps }) {
  const dependsOn = conf.dependsOn || [];

  const parentValues = useMemo(
    () =>
      dependsOn.map((p) => {
        const val = state[p];
        return Array.isArray(val) ? val : val ? [val] : [];
      }),
    [
      ...dependsOn.map((p) => {
        const val = state[p];
        return Array.isArray(val)
          ? val
              .map((v) => v.id)
              .sort()
              .join(",")
          : val?.id ?? -1;
      }),
    ]
  );

  const { options, loading } = useFilterOptions(
    config,
    conf.name,
    parentValues,
    extraDeps
  );

  return (
    <Box>
      <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
        {conf.label}:
      </Typography>
      {loading ? (
        <CircularProgress size={16} sx={{ verticalAlign: "middle" }} />
      ) : (
        <Typography component="span">{options.length} options</Typography>
      )}
    </Box>
  );
}
