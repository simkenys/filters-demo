import React, { createContext, useContext, useReducer, useMemo } from "react";

// -------------------- Default Filter State --------------------
const DEFAULT_STATE = {
  country: { id: -1, label: "All" },
  city: { id: -1, label: "All" },
  store: { id: -1, label: "All" },
};

// -------------------- Reducer --------------------
function filtersReducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "RESET_CHILD":
      return { ...state, [action.key]: { id: -1, label: "All" } };
    case "RESET":
      return { ...DEFAULT_STATE };
    default:
      return state;
  }
}

// -------------------- Context --------------------
// Default values avoid 'never' errors in VSCode
const FiltersContext = createContext({
  state: DEFAULT_STATE,
  set: () => {},
  reset: () => {},
  registerDeps: () => {},
});

// -------------------- Provider --------------------
export function FiltersProvider({ children }) {
  const [state, dispatch] = useReducer(filtersReducer, DEFAULT_STATE);
  const depsRef = React.useRef(new Map());

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

// -------------------- Hook --------------------
export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within FiltersProvider");
  return ctx;
}
