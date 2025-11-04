import { useEffect, useRef, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useFilters } from "../../context/FiltersProvider";
import { filterConfig } from "../../hooks/useFilterConfig";
import { useFilterOptions } from "../../hooks/useFilterOptions";

export default function FilterSelect({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps } = useFilters();
  const conf = filterConfig.find((f) => f.name === name);
  if (!conf) throw new Error(`FilterSelect: Unknown filter '${name}'`);

  // Full ancestor dependencies
  const dependsOn = conf.dependsOn || [];
  const parentValues = useMemo(
    () => dependsOn.map((p) => state[p]),
    [...dependsOn.map((p) => state[p]?.id ?? -1)]
  );

  // Fetch options based on all parent values
  const { options, loading } = useFilterOptions(name, parentValues, extraDeps);

  // Register dependencies for context
  useEffect(
    () => registerDeps(name, dependsOn),
    [name, dependsOn, registerDeps]
  );

  const selectedValue = state[name];
  const valDebounceRef = useRef(null);

  // ------------------------
  // Full dependency validation
  // ------------------------
  useEffect(() => {
    if (valDebounceRef.current) clearTimeout(valDebounceRef.current);

    valDebounceRef.current = setTimeout(() => {
      // Reset only if selected value does NOT exist in filtered options
      if (!selectedValue || selectedValue.id === -1) return;
      const exists = options.some((o) => o.id === selectedValue.id);
      if (!exists) set(name, conf.defaultValue);
    }, debounceMs);

    return () => clearTimeout(valDebounceRef.current);
  }, [
    options, // options are already filtered by all parent dependencies
    selectedValue,
    name,
    set,
    conf.defaultValue,
    ...dependsOn.map((p) => state[p]?.id ?? -1), // watch all ancestors
    ...extraDeps,
    debounceMs,
  ]);

  const handleChange = (e) => {
    const sel = options.find((o) => o.id === e.target.value);
    if (sel) set(name, sel);
  };

  return (
    <FormControl fullWidth disabled={loading}>
      <InputLabel>{conf.label}</InputLabel>
      <Select
        value={selectedValue?.id ?? -1}
        onChange={handleChange}
        label={conf.label}
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
