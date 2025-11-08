import { useEffect, useRef, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  CircularProgress,
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

  // Flatten parentValues to handle multi-select parents correctly
  const parentValues = useMemo(
    () =>
      dependsOn.flatMap((p) => {
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

  useEffect(
    () => registerDeps(name, dependsOn),
    [name, dependsOn, registerDeps]
  );

  const selectedValues = Array.isArray(state[name]) ? state[name] : [];
  const selectedIds = selectedValues.map((v) => v.id);

  const valDebounceRef = useRef(null);

  // -----------------------------
  // Validate selected values on options change (e.g., parent dependency changes)
  // -----------------------------
  useEffect(() => {
    if (valDebounceRef.current) clearTimeout(valDebounceRef.current);

    valDebounceRef.current = setTimeout(() => {
      if (!selectedValues.length) return;

      // Filter only valid options
      const validSelected = selectedValues.filter((sel) =>
        options.some((o) => o.id === sel.id)
      );

      // If none valid, reset to All (-1)
      if (validSelected.length === 0) {
        const allOption = options.find((o) => o.id === -1);
        if (allOption) set(name, [allOption]);
      } else if (validSelected.length !== selectedValues.length) {
        // Remove invalid ones, keep valid
        set(name, validSelected);
      }
    }, debounceMs);

    return () => clearTimeout(valDebounceRef.current);
  }, [
    options,
    selectedValues,
    name,
    set,
    ...dependsOn.map((p) => state[p]?.id ?? -1),
    ...extraDeps,
    debounceMs,
  ]);

  // -----------------------------
  // Handle user selection / All toggle
  // -----------------------------
  const handleChange = (e) => {
    const newIds = e.target.value;
    const prevIds = selectedIds;
    const optionsById = Object.fromEntries(options.map((o) => [o.id, o]));

    const added = newIds.filter((id) => !prevIds.includes(id));
    const removed = prevIds.filter((id) => !newIds.includes(id));

    let updatedSelection = [];

    if (added.length) {
      const clickedId = added[0];
      if (clickedId === -1) {
        // All clicked
        updatedSelection = [optionsById[-1]];
      } else {
        // Regular item clicked
        updatedSelection = newIds
          .filter((id) => id !== -1)
          .map((id) => optionsById[id]);
      }
    } else if (removed.length) {
      updatedSelection = newIds.map((id) => optionsById[id]);
      if (updatedSelection.length === 0) {
        updatedSelection = options.filter((o) => o.id === -1);
      }
    } else {
      updatedSelection = newIds.map((id) => optionsById[id]);
    }

    set(name, updatedSelection);

    // URL sync
    const newParams = new URLSearchParams(searchParams);
    if (updatedSelection.length === 1 && updatedSelection[0].id === -1) {
      newParams.delete(name);
    } else {
      newParams.set(name, updatedSelection.map((s) => s.id).join(","));
    }
    setSearchParams(newParams);
  };

  return (
    <FormControl fullWidth disabled={loading}>
      <InputLabel>{conf.label}</InputLabel>
      <Select
        multiple
        label={conf.label}
        value={selectedIds}
        onChange={handleChange}
        renderValue={(selected) => {
          const labels = options
            .filter((o) => selected.includes(o.id))
            .map((o) => o.label);
          return labels.join(", ");
        }}
        endAdornment={loading && <CircularProgress size={20} />}
      >
        {options.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>
            <Checkbox checked={selectedIds.includes(opt.id)} />
            <ListItemText primary={opt.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
