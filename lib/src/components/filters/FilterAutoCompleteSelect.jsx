import { useEffect, useRef, useMemo } from "react";
import { FormControl, TextField, CircularProgress } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useFilters } from "../../context/FiltersProvider";
import { useSearchParams } from "react-router-dom";
import { useFilterOptions } from "../../hooks/useFilterOptions";

/**
 * FilterAutoCompleteSelect
 * Single-select Autocomplete component for filters
 */
export default function FilterAutoCompleteSelect({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps, config: filterConfig } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  const conf = filterConfig.find((f) => f.name === name);
  if (!conf)
    throw new Error(`FilterAutoCompleteSelect: Unknown filter '${name}'`);

  const dependsOn = conf.dependsOn || [];

  // Parent values structured per parent
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

  // Register dependencies
  useEffect(
    () => registerDeps(name, dependsOn),
    [name, dependsOn, registerDeps]
  );

  const selectedValue = state[name];
  const valDebounceRef = useRef(null);

  // Debounced validation: reset selection if no longer in options
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

  // Handle change
  const handleChange = (_event, newValue) => {
    const valueToSet = newValue || conf.defaultValue;
    set(name, valueToSet);

    const newParams = new URLSearchParams(searchParams);
    newParams.set(name);
    setSearchParams(newParams);
  };

  return (
    <FormControl fullWidth disabled={loading}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label || ""}
        value={
          selectedValue?.id !== undefined ? selectedValue : conf.defaultValue
        }
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        clearOnEscape
        autoHighlight
        renderInput={(params) => (
          <TextField
            {...params}
            label={conf.label}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </FormControl>
  );
}
