import { useEffect, useRef, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useFilters } from "../../context/FiltersProvider";
import { filterConfig } from "../../hooks/useFilterConfig";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { useSearchParams } from "react-router-dom";

export default function FilterMultiSelect({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  const conf = filterConfig.find((f) => f.name === name);
  if (!conf) throw new Error(`FilterMultiSelect: Unknown filter '${name}'`);

  const dependsOn = conf.dependsOn || [];

  // Flatten parent values for multi-parent support
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

  const { options, loading } = useFilterOptions(name, parentValues, extraDeps);

  // Register dependencies
  useEffect(
    () => registerDeps(name, dependsOn),
    [name, dependsOn, registerDeps]
  );

  let selectedValues = state[name]; // Always array for multi-select
  const valDebounceRef = useRef(null);

  // ------------------------
  // Validation: remove invalid selections
  // ------------------------
  useEffect(() => {
    if (valDebounceRef.current) clearTimeout(valDebounceRef.current);

    valDebounceRef.current = setTimeout(() => {
      if (!selectedValues || selectedValues.length === 0) return;

      const validValues = selectedValues.filter((v) =>
        options.some((o) => o.id === v.id)
      );

      if (validValues.length !== selectedValues.length) {
        const fallback = Array.isArray(conf.defaultValue)
          ? conf.defaultValue
          : [conf.defaultValue];
        set(name, fallback);

        const newParams = new URLSearchParams(searchParams);
        newParams.delete(name); // Remove from URL (default should not be in URL)
        setSearchParams(newParams);
      }
    }, debounceMs);

    return () => clearTimeout(valDebounceRef.current);
  }, [
    options,
    selectedValues,
    name,
    set,
    conf.defaultValue,
    debounceMs,
    searchParams,
    setSearchParams,
  ]);

  const handleChange = (e) => {
    // e.target.value is an array of IDs from MUI
    const selectedIds = e.target.value;

    // Map IDs back to full option objects
    let newValues = options.filter((opt) => selectedIds.includes(opt.id));

    const hasAll = newValues.some((v) => v.id === -1);
    const hadAll = selectedValues.some((v) => v.id === -1);

    // Check if "All" was just clicked (it's now in the selection but wasn't before)
    const allJustClicked = hasAll && !hadAll;

    if (allJustClicked) {
      // "All" was just clicked - deselect everything else and select only "All"
      newValues = Array.isArray(conf.defaultValue)
        ? conf.defaultValue
        : [conf.defaultValue];
    } else if (hasAll && selectedIds.length > 1) {
      // "All" is selected along with other options - remove "All"
      newValues = newValues.filter((v) => v.id !== -1);
    } else if (hasAll && selectedIds.length === 1) {
      // ONLY "All" is selected - keep it
      newValues = Array.isArray(conf.defaultValue)
        ? conf.defaultValue
        : [conf.defaultValue];
    } else if (newValues.length === 0) {
      // Nothing selected - fallback to "All"
      newValues = Array.isArray(conf.defaultValue)
        ? conf.defaultValue
        : [conf.defaultValue];
    }

    // Update filter state
    set(name, newValues);

    // Sync URL: only include real IDs, never -1
    const newParams = new URLSearchParams(searchParams);
    const realIds = newValues.filter((v) => v.id !== -1).map((v) => v.id);

    if (realIds.length > 0) {
      newParams.set(name, realIds.join(","));
    } else {
      newParams.delete(name);
    }

    setSearchParams(newParams);
  };

  return (
    <FormControl fullWidth disabled={loading}>
      <InputLabel>{conf.label}</InputLabel>
      <Select
        multiple
        value={selectedValues.map((v) => v.id)}
        onChange={handleChange}
        label={conf.label}
        renderValue={(selected) =>
          selected
            .map((id) => options.find((o) => o.id === id)?.label || "")
            .join(", ")
        }
        endAdornment={loading && <CircularProgress size={20} />}
      >
        {options.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>
            <Checkbox checked={selectedValues.some((v) => v.id === opt.id)} />
            <ListItemText primary={opt.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
