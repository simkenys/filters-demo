import { createContext, useContext, useReducer, useMemo, useRef } from "react";
import { filterConfig } from "../hooks/useFilterConfig"; // ✅ correct import

const DEFAULT_STATE = Object.fromEntries(
  filterConfig.map((f) => [f.name, f.defaultValue])
);

function filtersReducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "RESET":
      return { ...DEFAULT_STATE };
    default:
      return state;
  }
}

const FiltersContext = createContext({
  state: DEFAULT_STATE,
  set: () => {},
  reset: () => {},
  registerDeps: () => {},
});

export function FiltersProvider({ children }) {
  const [state, dispatch] = useReducer(filtersReducer, DEFAULT_STATE);
  const depsRef = useRef(new Map());

  const registerDeps = (key, dependsOn) => {
    if (!dependsOn || dependsOn.length === 0) return;
    depsRef.current.set(key, dependsOn);
  };

  const value = useMemo(
    () => ({
      state,
      set: (key, value) => dispatch({ type: "SET", key, value }),
      reset: () => dispatch({ type: "RESET" }),
      registerDeps,
    }),
    [state]
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
