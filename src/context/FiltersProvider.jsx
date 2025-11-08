import React, { createContext, useContext, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { filterConfig } from "../hooks/useFilterConfig";

function buildDefaultState() {
  const state = {};
  filterConfig.forEach((f) => {
    state[f.name] = f.isMulti ? [f.defaultValue] : f.defaultValue;
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
  const depsRef = React.useRef(new Map());
  const [searchParams, setSearchParams] = useSearchParams();

  const registerDeps = (key, dependsOn) => {
    if (!dependsOn || dependsOn.length === 0) return;
    depsRef.current.set(key, dependsOn);
  };

  const setFilter = (key, value) => {
    dispatch({ type: "SET", key, value });
    const newParams = new URLSearchParams(searchParams);
    if (Array.isArray(value)) {
      newParams.set(key, value.map((v) => v.id).join(","));
    } else if (value && value.id !== undefined) {
      newParams.set(key, value.id);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const reset = () => {
    dispatch({ type: "RESET" });
    setSearchParams({});
  };

  useEffect(() => {
    for (const f of filterConfig) {
      const raw = searchParams.get(f.name);
      if (!raw) continue;

      if (f.isMulti) {
        const ids = raw.split(",").map((s) => parseInt(s, 10));
        if (f.fetcher) {
          f.fetcher({ parentValues: [] }).then((options) => {
            const matches = options.filter((o) => ids.includes(o.id));
            dispatch({ type: "SET", key: f.name, value: matches });
          });
        }
      } else {
        const id = parseInt(raw, 10);
        if (f.fetcher) {
          f.fetcher({ parentValues: [] }).then((options) => {
            const match = options.find((o) => o.id === id);
            if (match) dispatch({ type: "SET", key: f.name, value: match });
          });
        }
      }
    }
  }, []);

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
