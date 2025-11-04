// src/context/FiltersProvider.js
import { createContext, useContext, useReducer, useMemo, useRef } from "react";

const FiltersContext = createContext(null);

const cfg = useFilterConfig();
const DEFAULT_STATE = cfg.reduce((acc, f) => {
  acc[f.name] = f.defaultValue;
  return acc;
}, {});

function filtersReducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "RESET_CHILD":
      return {
        ...state,
        [action.key]: cfg.find((c) => c.name === action.key)?.defaultValue,
      };
    case "RESET":
      return { ...DEFAULT_STATE };
    default:
      return state;
  }
}

export function FiltersProvider({ children }) {
  const [state, dispatch] = useReducer(filtersReducer, DEFAULT_STATE);
  const depsRef = useRef(new Map()); // childName => dependsOn[]

  const registerDeps = (key, dependsOn) => {
    if (!dependsOn || dependsOn.length === 0) return;
    depsRef.current.set(key, dependsOn);
  };

  const set = (key, value) => {
    dispatch({ type: "SET", key, value });
    // do NOT validate children here; components do self-validation using the options hook
  };

  const reset = () => dispatch({ type: "RESET" });

  const api = useMemo(() => ({ state, set, reset, registerDeps }), [state]);

  return (
    <FiltersContext.Provider value={api}>{children}</FiltersContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside FiltersProvider");
  return ctx;
}
