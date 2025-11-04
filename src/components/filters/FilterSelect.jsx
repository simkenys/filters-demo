import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useFilters } from "../../context/FiltersContext";
import { useFilterOptions } from "../../hooks/useFilterOptions";

export default function FilterSelect({ name, label, dependsOn = [] }) {
  const { state, set, registerDeps } = useFilters();
  const selectedValue = state[name];

  const parentValues = dependsOn.map((dep) => state[dep]);

  // -------------------------
  // Fetch options via hook
  // Swap hook in prod to use SWR
  // -------------------------
  const { options, loading } = useFilterOptions(name, parentValues);

  React.useEffect(() => {
    registerDeps(name, dependsOn);
  }, [registerDeps, name, dependsOn]);

  const handleChange = (e) => {
    const selectedOption = options.find((opt) => opt.id === e.target.value);
    if (selectedOption) set(name, selectedOption);
  };

  return (
    <FormControl fullWidth disabled={loading}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={selectedValue?.id ?? -1}
        onChange={handleChange}
        label={label}
        endAdornment={loading && <CircularProgress size={20} />}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
