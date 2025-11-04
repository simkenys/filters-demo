// src/components/filters/FilterSelect.js
import { useEffect, useRef } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useFilters } from "../../context/FiltersProvider";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { useFilterConfig } from "../../hooks/useFilterconfig";

/**
 * props:
 *  - name (string, required)
 *  - debounceMs (optional: validation debounce, default 200)
 *  - extraDeps (optional array forwarded to useFilterOptions)
 */
export default function FilterSelect({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps } = useFilters();
  const selectedValue = state[name];

  const conf = useFilterConfig().find((c) => c.name === name);
  if (!conf) throw new Error(`FilterSelect: unknown filter '${name}'`);

  const dependsOn = conf.dependsOn || [];
  const parentValues = dependsOn.map((p) => state[p]);

  // fetch options (cache, abort, debounce inside hook)
  const { options, loading } = useFilterOptions(name, parentValues, extraDeps, {
    debounceMs: 100,
  });

  // register deps on mount/changes
  useEffect(() => {
    registerDeps(name, dependsOn);
  }, [name, dependsOn, registerDeps]);

  // debounced validation: only reset if current selection is no longer in options
  const valDebounceRef = useRef(null);
  useEffect(() => {
    if (valDebounceRef.current) clearTimeout(valDebounceRef.current);
    valDebounceRef.current = setTimeout(() => {
      if (!selectedValue || selectedValue.id === -1) return;
      const exists = options.some((o) => o.id === selectedValue.id);
      if (!exists) {
        set(name, conf.defaultValue);
      }
    }, debounceMs);

    return () => {
      if (valDebounceRef.current) clearTimeout(valDebounceRef.current);
    };
  }, [options, selectedValue, name, set, conf.defaultValue, debounceMs]);

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
