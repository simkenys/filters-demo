import React, { forwardRef, useEffect, useRef, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { FixedSizeList } from "react-window";
import { useFilters } from "../../context/FiltersProvider";
import { filterConfig } from "../../hooks/useFilterConfig";
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

export default function FilterSelectVirtualized({
  name,
  debounceMs = 200,
  extraDeps = [],
}) {
  const { state, set, registerDeps } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  const conf = filterConfig.find((f) => f.name === name);
  if (!conf)
    throw new Error(`FilterSelectVirtualized: Unknown filter '${name}'`);

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
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
