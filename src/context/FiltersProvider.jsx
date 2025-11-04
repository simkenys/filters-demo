// src/context/FiltersProvider.js
import { createContext, useContext, useReducer, useMemo, useRef } from "react";
import { useFilterConfig } from "../hooks/useFilterConfig";

const FiltersContext = createContext();

const filterConfig = useFilterConfig();
const DEFAULT_STATE = filterConfig.reduce((acc, f) => {
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
        [action.key]: filterConfig.find((f) => f.name === action.key)
          ?.defaultValue,
      };
    case "RESET":
      return { ...DEFAULT_STATE };
    default:
      return state;
  }
}

export const FiltersProvider = ({ children }) => {
  const [state, dispatch] = useReducer(filtersReducer, DEFAULT_STATE);
  const depsRef = useRef(new Map()); // childName => dependsOn[]

  const registerDeps = (key, dependsOn) => {
    if (!dependsOn || dependsOn.length === 0) return;
    depsRef.current.set(key, dependsOn);
  };

  const set = (key, value) => {
    dispatch({ type: "SET", key, value });
    // Do NOT reset children here; child components will self-validate
  };

  const reset = () => dispatch({ type: "RESET" });

  const value = useMemo(() => ({ state, set, reset, registerDeps }), [state]);

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within FiltersProvider");
  return ctx;
};
