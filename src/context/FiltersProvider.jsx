import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

const FiltersContext = createContext({
  state: {},
  set: () => {},
  reset: () => {},
  registerDeps: () => {},
  config: [],
  isInitialized: false,
  isLoading: false,
});

function filtersReducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "RESET":
      return action.defaultState;
    case "BATCH_SET":
      return { ...state, ...action.updates };
    default:
      return state;
  }
}

export function FiltersProvider({
  children,
  config,
  resetDependencies = false,
}) {
  // Build default state from config
  const buildDefaultState = () => {
    const state = {};
    config.forEach((f) => {
      state[f.name] = f.isMulti
        ? [{ ...f.defaultValue }]
        : { ...f.defaultValue };
    });
    return state;
  };

  const [state, dispatch] = React.useReducer(
    filtersReducer,
    null,
    buildDefaultState
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const depsRef = useRef(new Map());
  const requestIdRef = useRef(new Map());
  const isUpdatingRef = useRef(false);
  const pendingKeysRef = useRef(new Set());

  const registerDeps = (key, dependsOn) => {
    if (!dependsOn || dependsOn.length === 0) return;
    depsRef.current.set(key, dependsOn);
  };

  const setFilter = async (key, value) => {
    console.log("🔥 setFilter START:", key, value);
    const requestId = Date.now() + Math.random();

    // Mark that we're updating and lock all affected keys
    isUpdatingRef.current = true;
    pendingKeysRef.current.add(key);
    setIsLoading(true);

    // Build next state with parent update - DON'T dispatch yet
    const nextState = { ...state, [key]: value };
    const allUpdates = { [key]: value };

    // Collect all dependent children in dependency order
    const toProcess = [];
    const seen = new Set();
    const collectChildren = (parentKey) => {
      for (const f of config) {
        if (f.dependsOn?.includes(parentKey) && !seen.has(f.name)) {
          seen.add(f.name);
          toProcess.push(f.name);
          pendingKeysRef.current.add(f.name); // Lock this key too
          collectChildren(f.name);
        }
      }
    };
    collectChildren(key);

    console.log("📋 toProcess:", toProcess);

    // Process children SEQUENTIALLY in dependency order, not parallel
    for (const childKey of toProcess) {
      console.log("🔄 Processing child:", childKey);
      const f = config.find((fc) => fc.name === childKey);
      if (!f) continue;

      const currentValue = state[childKey];
      const childRequestId = requestId;
      requestIdRef.current.set(childKey, childRequestId);

      // Calculate new parent values for child using allUpdates (which now has all ancestors)
      const newParentValues = f.dependsOn.map((pKey) => {
        const parentValue =
          allUpdates[pKey] !== undefined ? allUpdates[pKey] : state[pKey];
        return Array.isArray(parentValue) ? parentValue : [parentValue];
      });

      console.log(`  📞 Fetching ${childKey} with parents:`, newParentValues);

      const useBackend = f.useBackend ?? false;

      try {
        const newOptions = f.fetcher
          ? await f.fetcher({ parentValues: newParentValues, useBackend })
          : f.isMulti
          ? [{ ...f.defaultValue }]
          : { ...f.defaultValue };

        console.log(
          `  ✅ Fetched ${childKey}, got ${
            Array.isArray(newOptions) ? newOptions.length : 1
          } options`
        );

        if (requestIdRef.current.get(childKey) !== childRequestId) continue;

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

        // Store the update immediately so next children can use it
        allUpdates[childKey] = newValue;
        nextState[childKey] = newValue;
      } catch (err) {
        console.error(`Error fetching dependent ${childKey}:`, err);
        // On error, keep current value instead of resetting
        allUpdates[childKey] = currentValue;
        nextState[childKey] = currentValue;
      }
    }

    // NOW dispatch all updates at once - parent + all children
    dispatch({ type: "BATCH_SET", updates: allUpdates });

    // Clear the locks
    pendingKeysRef.current.clear();
    isUpdatingRef.current = false;
    setIsLoading(false);

    // CRITICAL: Don't update URL params during initialization
    if (!isInitialized) {
      console.log("⏭️ Skipping URL update - still initializing");
      return;
    }

    // Build URL params from the final state
    const newParams = new URLSearchParams(searchParams);

    // Helper to update URL for a key/value pair
    const updateUrlParam = (paramKey, paramValue) => {
      if (Array.isArray(paramValue)) {
        const realIds = paramValue.filter((v) => v.id !== -1).map((v) => v.id);
        if (realIds.length > 0) newParams.set(paramKey, realIds.join(","));
        else newParams.delete(paramKey);
      } else if (
        paramValue &&
        paramValue.id !== undefined &&
        paramValue.id !== -1
      ) {
        newParams.set(paramKey, paramValue.id);
      } else {
        newParams.delete(paramKey);
      }
    };

    // Update URL for parent
    updateUrlParam(key, value);

    // Update URL for all children
    toProcess.forEach((childKey) => {
      if (allUpdates[childKey]) {
        updateUrlParam(childKey, allUpdates[childKey]);
      }
    });

    console.log("🔗 Setting URL params:", newParams.toString());
    setSearchParams(newParams);
  };

  const reset = () => {
    dispatch({ type: "RESET", defaultState: buildDefaultState() });
    setSearchParams({});
  };

  // Initialize filters from URL only once on mount
  useEffect(() => {
    if (isInitialized) return;

    const hasParams = Array.from(searchParams.keys()).some((key) =>
      config.some((f) => f.name === key)
    );

    if (!hasParams) {
      setIsInitialized(true);
      return;
    }

    console.log("🚀 Initializing from URL:", searchParams.toString());

    // Set loading state during initialization
    setIsLoading(true);

    // Capture URL params immediately to prevent them from being lost
    const urlParamsSnapshot = new URLSearchParams(searchParams);

    // Build a temporary state object from URL params to calculate parent values
    const urlState = {};

    // Initialize all filters sequentially, respecting dependencies
    const initializeFilters = async () => {
      const updates = {};

      // Sort filters by dependency depth (parents before children)
      const sortedFilters = [...config].sort((a, b) => {
        const aDepth = a.dependsOn?.length || 0;
        const bDepth = b.dependsOn?.length || 0;
        return aDepth - bDepth;
      });

      for (const f of sortedFilters) {
        const raw = urlParamsSnapshot.get(f.name);
        if (!raw) continue;

        console.log(`🔍 Initializing ${f.name} from URL:`, raw);

        // If no fetcher, trust the URL value and create minimal objects
        if (!f.fetcher) {
          if (f.isMulti) {
            const ids = raw.split(",").map((s) => parseInt(s, 10));
            const items = ids.map((id) => ({ id, label: `ID ${id}` }));
            updates[f.name] = items;
            urlState[f.name] = items;
          } else {
            const id = parseInt(raw, 10);
            const item = { id, label: `ID ${id}` };
            updates[f.name] = item;
            urlState[f.name] = item;
          }
          console.log(`✅ ${f.name} set (no fetcher):`, updates[f.name]);
          continue;
        }

        const useBackend = f.useBackend ?? false;

        // Calculate parent values from URL state, not current state
        const parentValues = (f.dependsOn || []).map((pKey) => {
          const parentValue = urlState[pKey] || state[pKey];
          return Array.isArray(parentValue) ? parentValue : [parentValue];
        });

        try {
          const options = await f.fetcher({ parentValues, useBackend });
          console.log(`  📦 Fetched ${options.length} options for ${f.name}`);

          if (f.isMulti) {
            const ids = raw.split(",").map((s) => parseInt(s, 10));
            const matches = options.filter((o) => ids.includes(o.id));
            if (matches.length > 0) {
              updates[f.name] = matches;
              urlState[f.name] = matches;
              console.log(`✅ ${f.name} set:`, matches);
            } else {
              // CRITICAL: If no matches found, preserve URL IDs with placeholder labels
              console.warn(
                `⚠️ Filter ${f.name}: No matches for IDs ${ids.join(
                  ", "
                )} in fetched options. Preserving URL values.`
              );
              const placeholders = ids.map((id) => ({ id, label: `ID ${id}` }));
              updates[f.name] = placeholders;
              urlState[f.name] = placeholders;
            }
          } else {
            const id = parseInt(raw, 10);
            const match = options.find((o) => o.id === id);
            if (match) {
              updates[f.name] = match;
              urlState[f.name] = match;
              console.log(`✅ ${f.name} set:`, match);
            } else {
              // CRITICAL: If no match found, preserve URL ID with placeholder label
              console.warn(
                `⚠️ Filter ${f.name}: No match for ID ${id} in fetched options. Preserving URL value.`
              );
              const placeholder = { id, label: `ID ${id}` };
              updates[f.name] = placeholder;
              urlState[f.name] = placeholder;
            }
          }
        } catch (err) {
          console.error(`❌ Error initializing ${f.name}:`, err);
          // CRITICAL: On fetch error, preserve URL values with placeholder labels
          if (f.isMulti) {
            const ids = raw.split(",").map((s) => parseInt(s, 10));
            const placeholders = ids.map((id) => ({ id, label: `ID ${id}` }));
            updates[f.name] = placeholders;
            urlState[f.name] = placeholders;
          } else {
            const id = parseInt(raw, 10);
            const placeholder = { id, label: `ID ${id}` };
            updates[f.name] = placeholder;
            urlState[f.name] = placeholder;
          }
        }
      }

      console.log("📝 Final updates:", updates);

      if (Object.keys(updates).length > 0) {
        dispatch({ type: "BATCH_SET", updates });
      }

      // CRITICAL: After initialization is complete, ensure URL hasn't been cleared
      // This prevents race conditions where validation logic might clear the URL
      const currentParams = new URLSearchParams(window.location.search);
      let urlWasCleared = false;

      for (const [key, value] of urlParamsSnapshot.entries()) {
        if (config.some((f) => f.name === key) && !currentParams.has(key)) {
          console.warn(
            `⚠️ URL param ${key} was cleared during initialization, restoring...`
          );
          currentParams.set(key, value);
          urlWasCleared = true;
        }
      }

      if (urlWasCleared) {
        setSearchParams(currentParams, { replace: true });
      }

      setIsInitialized(true);
      setIsLoading(false);
      console.log("✅ Initialization complete");
    };

    initializeFilters();
  }, []); // Only run once on mount

  const value = useMemo(
    () => ({
      state,
      set: setFilter,
      reset,
      registerDeps,
      isUpdating: isUpdatingRef.current,
      isPending: (key) => pendingKeysRef.current.has(key),
      isInitialized,
      isLoading,
      config, // Expose config in context so components can access it
    }),
    [state, config, isInitialized, isLoading]
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
