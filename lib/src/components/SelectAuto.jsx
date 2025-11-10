import { Box } from "@mui/material";
import FilterAutoCompleteMultiSelectVirtualized from "./filters/FilterAutoCompleteMultiSelectVirtualized";
import FilterAutoCompleteSelectVirtualized from "./filters/FilterAutoCompleteSelectVirtualized";
import FilterMultiSelectVirtualized from "./filters/FilterMultiSelectVirtualized";
import FilterSelectVirtualized from "./filters/FilterSelectVirtualized";

const SelectAuto = ({ filter: f, state }) => {
  // ✅ Check if this filter should be hidden based on parent
  if (f.hide && f.dependsOn?.length) {
    const directParentKey = f.dependsOn[f.dependsOn.length - 1]; // immediate parent
    const parentValue = state[directParentKey];
    if (!parentValue || parentValue.id === -1) {
      return null; // hide this filter
    }
  }

  // ✅ Then render the correct filter component
  return (
    <Box width={250}>
      {f ? (
        f.isAutoComplete ? (
          f.isMulti ? (
            <FilterAutoCompleteMultiSelectVirtualized name={f.name} />
          ) : (
            <FilterAutoCompleteSelectVirtualized name={f.name} />
          )
        ) : f.isMulti ? (
          <FilterMultiSelectVirtualized name={f.name} />
        ) : (
          <FilterSelectVirtualized name={f.name} />
        )
      ) : null}
    </Box>
  );
};

export default SelectAuto;
