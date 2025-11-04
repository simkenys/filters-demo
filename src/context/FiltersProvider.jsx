import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
} from "react";
import { useSearchParams } from "react-router-dom";
import { filterConfig } from "../hooks/useFilterConfig";

function buildDefaultState() {
  const state = {};
  filterConfig.forEach((f) => {
    state[f.name] = f.defaultValue;
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
  const [state, dispatch] = useReducer(filtersReducer, buildDefaultState());
  const depsRef = React.useRef(new Map());
  const [searchParams, setSearchParams] = useSearchParams();

  const registerDeps = (key, dependsOn) => {
    if (!dependsOn || dependsOn.length === 0) return;
    depsRef.current.set(key, dependsOn);
  };

  const setFilter = (key, value) => {
    dispatch({ type: "SET", key, value });
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value.id);
    setSearchParams(newParams);
  };

  const reset = () => {
    dispatch({ type: "RESET" });
    setSearchParams({});
  };

  // Initialize from URL
  useEffect(() => {
    for (const f of filterConfig) {
      const idStr = searchParams.get(f.name);
      if (idStr) {
        const id = parseInt(idStr, 10);
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
