import { useEffect, useRef, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useFilters } from "../../context/FiltersProvider";
import { useSearchParams } from "react-router-dom";
import { useFilterOptions } from "../../hooks/useFilterOptions";

export default function FilterSelect({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps, config: filterConfig } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  const conf = filterConfig.find((f) => f.name === name);
  if (!conf) throw new Error(`FilterSelect: Unknown filter '${name}'`);

  const dependsOn = conf.dependsOn || [];

  // Parent values structured per parent (array of arrays)
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
    filterConfig,
    name,
    parentValues,
    extraDeps
  );

  useEffect(
    () => registerDeps(name, dependsOn),
    [name, dependsOn, registerDeps]
  );

  const selectedValue = state[name];
  const valDebounceRef = useRef(null);

  useEffect(() => {
    if (valDebounceRef.current) clearTimeout(valDebounceRef.current);

    valDebounceRef.current = setTimeout(() => {
      if (!selectedValue || selectedValue.id === -1) return;

      const exists = options.some((o) => o.id === selectedValue.id);
      if (!exists) {
        set(name, conf.defaultValue);

        // Update URL on reset
        const newParams = new URLSearchParams(searchParams);
        newParams.set(name, conf.defaultValue.id);
        setSearchParams(newParams);
      }
    }, debounceMs);

    return () => clearTimeout(valDebounceRef.current);
  }, [
    options,
    selectedValue,
    name,
    set,
    conf.defaultValue,
    ...dependsOn.map((p) => {
      const val = state[p];
      return Array.isArray(val)
        ? val
            .map((v) => v.id)
            .sort()
            .join(",")
        : val?.id ?? -1;
    }),
    ...extraDeps,
    debounceMs,
    searchParams,
    setSearchParams,
  ]);

  const handleChange = (e) => {
    const sel = options.find((o) => o.id === e.target.value);
    if (sel) {
      set(name, sel);

      // Sync selection to URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set(name, sel.id);
      setSearchParams(newParams);
    }
  };

  return (
    <FormControl fullWidth disabled={loading}>
      <InputLabel>{conf.label}</InputLabel>
      <Select
        value={selectedValue?.id ?? conf.defaultValue.id}
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
