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
import { useSearchParams } from "react-router-dom";

export default function FilterSelect({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  const conf = filterConfig.find((f) => f.name === name);
  if (!conf) throw new Error(`FilterSelect: Unknown filter '${name}'`);

  const dependsOn = conf.dependsOn || [];

  // Flatten parent values for multi-parent support
  const parentValues = useMemo(() => {
    return dependsOn.flatMap((p) => {
      const val = state[p];
      return Array.isArray(val) ? val : val ? [val] : [];
    });
  }, [
    ...dependsOn.map((p) => {
      const val = state[p];
      return Array.isArray(val)
        ? val
            .map((v) => v.id)
            .sort()
            .join(",")
        : val?.id ?? -1;
    }),
  ]);

  const { options, loading } = useFilterOptions(name, parentValues, extraDeps);

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
