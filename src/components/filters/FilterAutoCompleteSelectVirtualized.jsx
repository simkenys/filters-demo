import React, { useEffect, useRef, useMemo } from "react";
import { FormControl, TextField, CircularProgress } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { VariableSizeList } from "react-window";
import { useFilters } from "../../context/FiltersProvider";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { useSearchParams } from "react-router-dom";

/**
 * ListboxComponent for virtualized rendering in Autocomplete
 * Uses react-window's VariableSizeList for better compatibility with Autocomplete
 */
const ListboxComponent = React.forwardRef(function ListboxComponent(
  props,
  ref
) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;
  const itemSize = 48; // Default height for each option

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemCount * itemSize;
  };

  const getItemSize = () => itemSize;

  return (
    <div ref={ref}>
      <div {...other}>
        <VariableSizeList
          height={getHeight()}
          width="100%"
          itemSize={getItemSize}
          itemCount={itemCount}
          itemData={itemData}
          overscanCount={5}
        >
          {({ index, style, data }) => {
            return React.cloneElement(data[index], {
              style: {
                ...style,
                ...(data[index].props.style || {}),
              },
            });
          }}
        </VariableSizeList>
      </div>
    </div>
  );
});

/**
 * FilterAutoCompleteSelect
 * Single-select Autocomplete component for filters
 */
export default function FilterAutoCompleteSelectVirtualized({
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

  const { options, loading } = useFilterOptions(name, parentValues, extraDeps);

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
    newParams.set(name, valueToSet.id);
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
        ListboxComponent={ListboxComponent}
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
