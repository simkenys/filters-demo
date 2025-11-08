import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useSearchParams } from "react-router-dom";
import { filterConfig, resetDependencies } from "../hooks/useFilterConfig";

function buildDefaultState() {
  const state = {};
  filterConfig.forEach((f) => {
    state[f.name] = f.isMulti ? [{ ...f.defaultValue }] : { ...f.defaultValue };
  });
  return state;
}

const FiltersContext = createContext({
  state: {},
  set: () => {},
  reset: () => {},
  registerDeps: () => {},
});

function filtersReducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "RESET":
      return buildDefaultState();
    default:
      return state;
  }
}

export function FiltersProvider({ children }) {
  const [state, dispatch] = React.useReducer(
    filtersReducer,
    buildDefaultState()
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const depsRef = useRef(new Map());

  const registerDeps = (key, dependsOn) => {
    if (!dependsOn || dependsOn.length === 0) return;
    depsRef.current.set(key, dependsOn);
  };

  // Compute parentValues for a filter
  // Returns array of arrays (one array per parent dependency)
  const getParentValues = (filter) => {
    if (!filter.dependsOn || filter.dependsOn.length === 0) return [];
    return filter.dependsOn.map((pKey) => {
      const parentValue = state[pKey];
      // Wrap single-select values in array, keep multi-select as-is
      return Array.isArray(parentValue) ? parentValue : [parentValue];
    });
  };

  const setFilter = async (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    // Update parent filter value
    dispatch({ type: "SET", key, value });
    if (Array.isArray(value))
      newParams.set(key, value.map((v) => v.id).join(","));
    else if (value && value.id !== undefined) newParams.set(key, value.id);
    else newParams.delete(key);

    // Handle dependent children based on resetDependencies flag
    if (resetDependencies) {
      // OLD BEHAVIOR: Reset dependent children recursively
      const toReset = new Set();

      const collectChildren = (parentKey) => {
        for (const f of filterConfig) {
          if (f.dependsOn?.includes(parentKey) && !toReset.has(f.name)) {
            toReset.add(f.name);
            collectChildren(f.name);
          }
        }
      };
      collectChildren(key);

      toReset.forEach((childKey) => {
        const f = filterConfig.find((fc) => fc.name === childKey);
        if (!f) return;

        const resetValue = f.isMulti
          ? [{ ...f.defaultValue }]
          : { ...f.defaultValue };
        dispatch({ type: "SET", key: f.name, value: resetValue });

        // Remove from URL
        newParams.delete(f.name);
      });

      // Finally, update URL after all resets
      setSearchParams(newParams);
    } else {
      // NEW BEHAVIOR: Filter dependent children to keep only valid values
      // Create a "next state" object with the updated parent value
      const nextState = { ...state, [key]: value };

      const toFilter = [];

      const collectChildren = (parentKey) => {
        for (const f of filterConfig) {
          if (
            f.dependsOn?.includes(parentKey) &&
            !toFilter.find((item) => item === f.name)
          ) {
            toFilter.push(f.name);
            collectChildren(f.name);
          }
        }
      };
      collectChildren(key);

      // Process all dependent children and wait for all fetchers
      const filterPromises = toFilter.map(async (childKey) => {
        const f = filterConfig.find((fc) => fc.name === childKey);
        if (!f || !f.fetcher) return;

        const currentValue = state[childKey];

        // Calculate new parent values using nextState
        // Each parent value should be an array (wrap single-select values)
        const newParentValues = f.dependsOn.map((pKey) => {
          const parentValue = nextState[pKey];
          return Array.isArray(parentValue) ? parentValue : [parentValue];
        });

        const useBackend = f.useBackend ?? false;

        try {
          const newOptions = await f.fetcher({
            parentValues: newParentValues,
            useBackend,
          });
          const validIds = new Set(newOptions.map((o) => o.id));

          if (f.isMulti) {
            console.log("Filtering", f.name);
            console.log("currentValue:", currentValue);
            console.log("newOptions:", newOptions);
            console.log("validIds:", Array.from(validIds));

            const filteredValue = currentValue.filter((item) => {
              const isValid = item.id !== undefined && validIds.has(item.id);
              console.log(`Item ${item.label} (id: ${item.id}): ${isValid}`);
              return isValid;
            });

            console.log("filteredValue:", filteredValue);

            const newValue =
              filteredValue.length > 0
                ? filteredValue
                : [{ ...f.defaultValue }];

            dispatch({ type: "SET", key: f.name, value: newValue });

            if (newValue.length === 1 && newValue[0].id === undefined) {
              newParams.delete(f.name);
            } else {
              newParams.set(f.name, newValue.map((v) => v.id).join(","));
            }
          } else {
            // For single select, check if current value is still valid
            if (
              currentValue.id !== undefined &&
              validIds.has(currentValue.id)
            ) {
              // Keep current value - no changes needed
            } else {
              // Reset to default
              const resetValue = { ...f.defaultValue };
              dispatch({ type: "SET", key: f.name, value: resetValue });
              newParams.delete(f.name);
            }
          }
        } catch (error) {
          console.error(`Error filtering dependent ${f.name}:`, error);
        }
      });

      // Wait for all filtering to complete before updating URL
      await Promise.all(filterPromises);
      setSearchParams(newParams);
    }
  };

  const reset = () => {
    dispatch({ type: "RESET" });
    setSearchParams({});
  };

  // Initialize filters from URL
  useEffect(() => {
    filterConfig.forEach((f) => {
      const raw = searchParams.get(f.name);
      if (!raw) return;

      const useBackend = f.useBackend ?? false;

      if (f.fetcher) {
        const parentValues = getParentValues(f);
        if (f.isMulti) {
          const ids = raw.split(",").map((s) => parseInt(s, 10));
          f.fetcher({ parentValues, useBackend }).then((options) => {
            const matches = options.filter((o) => ids.includes(o.id));
            dispatch({ type: "SET", key: f.name, value: matches });
          });
        } else {
          const id = parseInt(raw, 10);
          f.fetcher({ parentValues, useBackend }).then((options) => {
            const match = options.find((o) => o.id === id);
            if (match) dispatch({ type: "SET", key: f.name, value: match });
          });
        }
      }
    });
  }, [searchParams]);

  const value = useMemo(
    () => ({ state, set: setFilter, reset, registerDeps }),
    [state, searchParams]
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within FiltersProvider");
  return ctx;
}
