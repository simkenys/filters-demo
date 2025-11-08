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
  const getParentValues = (filter) => {
    if (!filter.dependsOn || filter.dependsOn.length === 0) return [];
    return filter.dependsOn.map((pKey) => state[pKey]).flat();
  };

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    // Update parent filter value
    dispatch({ type: "SET", key, value });
    if (Array.isArray(value))
      newParams.set(key, value.map((v) => v.id).join(","));
    else if (value && value.id !== undefined) newParams.set(key, value.id);
    else newParams.delete(key);

    // Reset dependent children recursively
    if (resetDependencies) {
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
    }

    // Finally, update URL after all resets
    setSearchParams(newParams);
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
