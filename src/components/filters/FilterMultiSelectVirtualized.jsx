import React, { forwardRef, useEffect, useRef, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { FixedSizeList } from "react-window";
import { useFilters } from "../../context/FiltersProvider";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { useSearchParams } from "react-router-dom";

/**
 * MenuListVirtual
 * - `forwardRef` so MUI's ref is forwarded to the inner <ul> element (so .focus() works)
 * - virtualizes rendering of children (which are MenuItem elements) with react-window
 */
const MenuListVirtual = forwardRef(function MenuListVirtual(
  { children, itemSize = 48, height = 300, ...rest },
  ref
) {
  const items = React.Children.toArray(children || []);
  const itemCount = items.length;
  const listRef = useRef(null);

  // inner element type that renders <ul> and receives the innerRef from react-window.
  // We also forward that inner DOM node to MUI's ref so MUI can call focus().
  const InnerElementType = forwardRef(function InnerElementType(
    innerProps,
    innerRef
  ) {
    // innerRef is the ref react-window will set to the <ul>; we want to keep that,
    // but also set the `ref` provided by MUI to the same DOM node so MUI can focus it.
    const handleRef = (node) => {
      if (typeof innerRef === "function") innerRef(node);
      else if (innerRef) innerRef.current = node;

      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <ul
        {...innerProps}
        ref={handleRef}
        tabIndex={-1}
        style={{ margin: 0, padding: 0 }}
      />
    );
  });

  // Row renderer clones the original MenuItem child and injects the style prop
  const Row = ({ index, style }) => {
    const child = items[index];
    // clone to inject style (react-window positioning)
    return React.cloneElement(child, {
      style: {
        ...(child.props.style || {}),
        ...style,
      },
    });
  };

  const listHeight = Math.min(height, itemCount * itemSize);

  return (
    <div {...rest}>
      <FixedSizeList
        ref={listRef}
        height={listHeight}
        itemCount={itemCount}
        itemSize={itemSize}
        width="100%"
        innerElementType={InnerElementType}
        overscanCount={5}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
});

export default function FilterMultiSelectVirtualized({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const {
    state,
    set,
    registerDeps,
    config: filterConfig,
    isInitialized,
  } = useFilters();
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
    // CRITICAL: Don't validate during initialization
    if (!isInitialized) return;

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
    isInitialized,
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
        // Let MUI render its Menu and MenuList as usual, but override MenuList with our virtualized component.
        MenuProps={{
          PaperProps: {
            style: { overflow: "hidden" },
          },
          // This is the correct hook: override the MenuList component
          MenuListProps: {
            component: MenuListVirtual,
            // pass props down; MUI will pass children (MenuItems) into MenuListVirtual
            // react-window sizing defaults work, but you can pass itemSize/height via MenuListProps if you want
          },
        }}
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
