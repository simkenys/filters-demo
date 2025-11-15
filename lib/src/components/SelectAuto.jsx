import { Box } from "@mui/material";
import FilterAutoCompleteMultiSelectVirtualized from "./filters/FilterAutoCompleteMultiSelectVirtualized";
import FilterAutoCompleteSelectVirtualized from "./filters/FilterAutoCompleteSelectVirtualized";
import FilterMultiSelectVirtualized from "./filters/FilterMultiSelectVirtualized";
import FilterSelectVirtualized from "./filters/FilterSelectVirtualized";

const SelectAuto = ({ filter: f, state, extraDeps = [], debounceMs = 200 }) => {
  // ✅ Check if this filter should be hidden based on parent
  if (f.hide && f.dependsOn?.length) {
    const directParentKey = f.dependsOn[f.dependsOn.length - 1]; // immediate parent
    const parentValue = state[directParentKey];

    // Handle both object and array forms
    const isAllSelected = Array.isArray(parentValue)
      ? parentValue.some((v) => v.id === -1)
      : parentValue?.id === -1;

    if (!parentValue || isAllSelected) {
      return null; // hide this filter
    }
  }

  // ✅ Then render the correct filter component
  return (
    <Box width={250}>
      {f ? (
        f.isAutoComplete ? (
          f.isMulti ? (
            <FilterAutoCompleteMultiSelectVirtualized
              name={f.name}
              extraDeps={extraDeps}
              debounceMs={debounceMs}
            />
          ) : (
            <FilterAutoCompleteSelectVirtualized
              name={f.name}
              extraDeps={extraDeps}
              debounceMs={debounceMs}
            />
          )
        ) : f.isMulti ? (
          <FilterMultiSelectVirtualized
            name={f.name}
            extraDeps={extraDeps}
            debounceMs={debounceMs}
          />
        ) : (
          <FilterSelectVirtualized
            name={f.name}
            extraDeps={extraDeps}
            debounceMs={debounceMs}
          />
        )
      ) : null}
    </Box>
  );
};

export default SelectAuto;
