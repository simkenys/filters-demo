import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  FormControl,
  TextField,
  CircularProgress,
  Checkbox,
  ListItemText,
  Box,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { VariableSizeList } from "react-window";
import { useFilters } from "../../context/FiltersProvider";
import { filterConfig } from "../../hooks/useFilterConfig";
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
 * FilterAutoCompleteMultiSelect
 * Multi-select Autocomplete styled like regular Select+Checkbox
 * with improved search string display
 */
export default function FilterAutoCompleteMultiSelectVirtualized({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState("");

  const conf = filterConfig.find((f) => f.name === name);
  if (!conf)
    throw new Error(`FilterAutoCompleteMultiSelect: Unknown filter '${name}'`);

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

  let selectedValues = state[name]; // Always array
  const valDebounceRef = useRef(null);

  // Validation: remove invalid selections
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
        newParams.delete(name);
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

  // Handle change
  const handleChange = (_event, newValues) => {
    let updatedValues = newValues || [];

    const hasAll = updatedValues.some((v) => v.id === -1);
    const hadAll = selectedValues.some((v) => v.id === -1);
    const allJustClicked = hasAll && !hadAll;

    if (allJustClicked) {
      updatedValues = Array.isArray(conf.defaultValue)
        ? conf.defaultValue
        : [conf.defaultValue];
    } else if (hasAll && updatedValues.length > 1) {
      updatedValues = updatedValues.filter((v) => v.id !== -1);
    } else if (hasAll && updatedValues.length === 1) {
      updatedValues = Array.isArray(conf.defaultValue)
        ? conf.defaultValue
        : [conf.defaultValue];
    } else if (updatedValues.length === 0) {
      updatedValues = Array.isArray(conf.defaultValue)
        ? conf.defaultValue
        : [conf.defaultValue];
    }

    // Update filter state
    set(name, updatedValues);

    // Sync URL (exclude -1)
    const newParams = new URLSearchParams(searchParams);
    const realIds = updatedValues.filter((v) => v.id !== -1).map((v) => v.id);
    if (realIds.length > 0) {
      newParams.set(name, realIds.join(","));
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  return (
    <FormControl fullWidth disabled={loading}>
      <Autocomplete
        multiple
        options={options}
        getOptionLabel={(option) => option.label || ""}
        value={selectedValues}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        disableCloseOnSelect
        ListboxComponent={ListboxComponent}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            <ListItemText primary={option.label} />
          </li>
        )}
        onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
        renderTags={(tagValue, _getTagProps) => {
          // Use inputValue from state, not ownerState
          if (inputValue && inputValue.length > 0) return null;

          // Create a single-line comma-separated string
          const displayText = tagValue.map((option) => option.label).join(", ");

          return (
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                paddingRight: "4px",
              }}
            >
              {displayText}
            </Box>
          );
        }}
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
