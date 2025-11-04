import { useEffect, useRef } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useFilters } from "../../context/FiltersProvider";
import { useFilterConfig } from "../../hooks/useFilterConfig";
import { useFilterOptions } from "../../hooks/useFilterOptions";

export default function FilterSelect({ name, debounceMs = 200 }) {
  const { state, set, registerDeps } = useFilters();
  const selectedValue = state[name];

  const filterConf = useFilterConfig().find((f) => f.name === name);
  const dependsOn = filterConf.dependsOn || [];
  const parentValues = dependsOn.map((dep) => state[dep]);

  // Fetch options
  const { options, loading } = useFilterOptions(name, parentValues);

  // Register dependencies once
  useEffect(() => {
    registerDeps(name, dependsOn);
  }, [name, dependsOn, registerDeps]);

  // -------------------------------
  // Debounced child validation
  // -------------------------------
  const debounceRef = useRef();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!selectedValue || selectedValue.id === -1) return; // "All" is always valid

      const exists = options.some((opt) => opt.id === selectedValue.id);
      if (!exists) set(name, filterConf.defaultValue);
    }, debounceMs);

    return () => clearTimeout(debounceRef.current);
  }, [options, selectedValue, name, set, filterConf.defaultValue, debounceMs]);

  const handleChange = (e) => {
    const value = options.find((opt) => opt.id === e.target.value);
    if (value) set(name, value);
  };

  return (
    <FormControl fullWidth disabled={loading}>
      <InputLabel>{filterConf.label}</InputLabel>
      <Select
        value={selectedValue?.id ?? -1}
        onChange={handleChange}
        label={filterConf.label}
        endAdornment={loading && <CircularProgress size={20} />}
      >
        {options.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
