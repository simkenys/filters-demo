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
    case "BATCH_SET":
      return { ...state, ...action.updates };
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
  const requestIdRef = useRef(new Map());
  const isInitializedRef = useRef(false);

  const registerDeps = (key, dependsOn) => {
    if (!dependsOn || dependsOn.length === 0) return;
    depsRef.current.set(key, dependsOn);
  };

  const getParentValues = (filter) => {
    if (!filter.dependsOn || filter.dependsOn.length === 0) return [];
    return filter.dependsOn.map((pKey) => {
      const parentValue = state[pKey];
      return Array.isArray(parentValue) ? parentValue : [parentValue];
    });
  };

  const setFilter = async (key, value) => {
    const requestId = Date.now() + Math.random();

    // Build next state with parent update
    const nextState = { ...state, [key]: value };
    const allUpdates = { [key]: value };

    // Collect all dependent children
    const toProcess = [];
    const collectChildren = (parentKey) => {
      for (const f of filterConfig) {
        if (f.dependsOn?.includes(parentKey) && !toProcess.includes(f.name)) {
          toProcess.push(f.name);
          collectChildren(f.name);
        }
      }
    };
    collectChildren(key);

    // Process each child and collect their updates
    const childPromises = toProcess.map(async (childKey) => {
      const f = filterConfig.find((fc) => fc.name === childKey);
      if (!f) return null;

      const currentValue = state[childKey];
      const childRequestId = requestId;
      requestIdRef.current.set(childKey, childRequestId);

      // Calculate new parent values for child
      const newParentValues = f.dependsOn.map((pKey) => {
        const parentValue = nextState[pKey] || allUpdates[pKey] || state[pKey];
        return Array.isArray(parentValue) ? parentValue : [parentValue];
      });

      const useBackend = f.useBackend ?? false;

      try {
        const newOptions = f.fetcher
          ? await f.fetcher({ parentValues: newParentValues, useBackend })
          : f.isMulti
          ? [{ ...f.defaultValue }]
          : { ...f.defaultValue };

        if (requestIdRef.current.get(childKey) !== childRequestId) return null;

        const validIds = new Set(
          Array.isArray(newOptions)
            ? newOptions.map((o) => o.id)
            : [newOptions.id]
        );

        let newValue;

        if (resetDependencies) {
          // FULL RESET to default
          newValue = f.isMulti
            ? [{ ...f.defaultValue }]
            : { ...f.defaultValue };
        } else {
          // Filter invalid selections
          if (f.isMulti) {
            const filteredValue = currentValue.filter(
              (item) => item.id !== undefined && validIds.has(item.id)
            );
            newValue =
              filteredValue.length > 0
                ? filteredValue
                : [{ ...f.defaultValue }];
          } else {
            newValue = validIds.has(currentValue.id)
              ? currentValue
              : { ...f.defaultValue };
          }
        }

        // Store the update for batch processing
        allUpdates[childKey] = newValue;
        nextState[childKey] = newValue;

        return { key: childKey, value: newValue };
      } catch (err) {
        console.error(`Error fetching dependent ${childKey}:`, err);
        return null;
      }
    });

    const childResults = await Promise.all(childPromises);

    // Batch update all state changes at once
    dispatch({ type: "BATCH_SET", updates: allUpdates });

    // Now build URL params from the final state
    const newParams = new URLSearchParams(searchParams);

    // Update URL for parent
    if (Array.isArray(value)) {
      const realIds = value.filter((v) => v.id !== -1).map((v) => v.id);
      if (realIds.length > 0) newParams.set(key, realIds.join(","));
      else newParams.delete(key);
    } else if (value && value.id !== undefined && value.id !== -1) {
      newParams.set(key, value.id);
    } else {
      newParams.delete(key);
    }

    // Update URL for all children
    childResults.forEach((result) => {
      if (!result) return;

      const { key: childKey, value: childValue } = result;

      if (Array.isArray(childValue)) {
        const realIds = childValue.filter((v) => v.id !== -1).map((v) => v.id);
        if (realIds.length > 0) newParams.set(childKey, realIds.join(","));
        else newParams.delete(childKey);
      } else if (
        childValue &&
        childValue.id !== undefined &&
        childValue.id !== -1
      ) {
        newParams.set(childKey, childValue.id);
      } else {
        newParams.delete(childKey);
      }
    });

    setSearchParams(newParams);
  };

  const reset = () => {
    dispatch({ type: "RESET" });
    setSearchParams({});
  };

  // Initialize filters from URL only once on mount
  useEffect(() => {
    if (isInitializedRef.current) return;

    const hasParams = Array.from(searchParams.keys()).some((key) =>
      filterConfig.some((f) => f.name === key)
    );

    if (!hasParams) {
      isInitializedRef.current = true;
      return;
    }

    const initPromises = filterConfig.map(async (f) => {
      const raw = searchParams.get(f.name);
      if (!raw || !f.fetcher) return null;

      const useBackend = f.useBackend ?? false;
      const parentValues = getParentValues(f);

      try {
        const options = await f.fetcher({ parentValues, useBackend });

        if (f.isMulti) {
          const ids = raw.split(",").map((s) => parseInt(s, 10));
          const matches = options.filter((o) => ids.includes(o.id));
          if (matches.length > 0) {
            return { key: f.name, value: matches };
          }
        } else {
          const id = parseInt(raw, 10);
          const match = options.find((o) => o.id === id);
          if (match) {
            return { key: f.name, value: match };
          }
        }
      } catch (err) {
        console.error(`Error initializing ${f.name}:`, err);
      }

      return null;
    });

    Promise.all(initPromises).then((results) => {
      const updates = {};
      results.forEach((result) => {
        if (result) {
          updates[result.key] = result.value;
        }
      });

      if (Object.keys(updates).length > 0) {
        dispatch({ type: "BATCH_SET", updates });
      }

      isInitializedRef.current = true;
    });
  }, []); // Only run once on mount

  const value = useMemo(
    () => ({ state, set: setFilter, reset, registerDeps }),
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
