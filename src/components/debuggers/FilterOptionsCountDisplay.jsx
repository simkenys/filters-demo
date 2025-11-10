import { useMemo } from "react";
import { useFilters } from "../../context/FiltersProvider";
import { filterConfig } from "../../hooks/useFilterConfig";
import { useFilterOptions } from "../../hooks/useFilterOptions";

export default function FilterOptionsCountDisplay({ extraDeps = [] }) {
  const { state } = useFilters();

  return (
    <div
      style={{
        padding: "1rem",
        fontFamily: "monospace",
        background: "#f7f7f7",
        borderRadius: 8,
        marginTop: "1rem",
        lineHeight: 1.5,
      }}
    >
      <h4 style={{ marginTop: 0 }}>🔍 Filter Options Debugger</h4>
      {filterConfig.map((conf) => (
        <FilterOptionsCount
          key={conf.name}
          conf={conf}
          state={state}
          extraDeps={extraDeps}
        />
      ))}
    </div>
  );
}

function FilterOptionsCount({ conf, state, extraDeps }) {
  const dependsOn = conf.dependsOn || [];

  // Build parent values same way as in FilterSelect
  const parentValues = useMemo(
    () =>
      dependsOn.map((p) => {
        const val = state[p];
        return Array.isArray(val) ? val : val ? [val] : [];
      }),
    [
      ...dependsOn.map((p) => {
        const val = state[p];
        return Array.isArray(val)
          ? val
              .map((v) => v.id)
              .sort()
              .join(",")
          : val?.id ?? -1;
      }),
    ]
  );

  const { options, loading } = useFilterOptions(
    conf.name,
    parentValues,
    extraDeps
  );

  return (
    <div>
      <strong>{conf.label}</strong>:{" "}
      {loading ? "loading..." : `${options.length} options`}
    </div>
  );
}
