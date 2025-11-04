// src/components/filters/FilterSelect.js
import React, { useEffect, useRef } from "react";
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

/**
 * FilterSelect
 *
 * Props:
 * - name: filter name (string, required)
 * - debounceMs: optional debounce delay for validation (default 200ms)
 * - extraDeps: optional array of external deps forwarded to useFilterOptions (e.g. [userId, dateRange])
 */
export default function FilterSelect({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps } = useFilters();
  const selectedValue = state[name];

  const filterConf = useFilterConfig().find((f) => f.name === name);
  if (!filterConf) throw new Error(`FilterSelect: unknown filter '${name}'`);

  const dependsOn = filterConf.dependsOn || [];
  const parentValues = dependsOn.map((dep) => state[dep]);

  // Fetch options using wrapper; cache and extraDeps supported
  const { options, loading } = useFilterOptions(name, parentValues, extraDeps);

  // Register dependencies (provider uses this only for wiring; child validation in component)
  useEffect(() => {
    registerDeps(name, dependsOn);
  }, [name, dependsOn, registerDeps]);

  // Debounced validation: only reset if selected value is not in options
  const debounceRef = useRef(null);
  useEffect(() => {
    // clear any existing timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!selectedValue || selectedValue.id === -1) return; // "All" is always valid
      const exists = options.some((opt) => opt.id === selectedValue.id);
      if (!exists) {
        set(name, filterConf.defaultValue);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // include options and parent ids and extraDeps in deps are covered via options dependency in useFilterOptions
  }, [options, selectedValue, name, set, filterConf.defaultValue, debounceMs]);

  const handleChange = (e) => {
    const option = options.find((opt) => opt.id === e.target.value);
    if (option) set(name, option);
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
