/* eslint-disable no-unused-vars */
// GET VERSION
import { ALL_OPTION } from "../hooks/useFilterConstants";

export async function fetchFromBackend({
  parentValues,
  filterProps,
  endpoint, // Accept but may not use in URL
}) {
  // Optionally include extraDeps in API call if your backend needs them
  // extraDeps.forEach((dep, idx) => {
  //   params.append(`extra${idx}`, dep);
  // });

  // console.log("extraDeps", extraDeps);

  // Flatten parent selections and filter out -1 (All)
  const flatParents = parentValues
    .map((level, idx) =>
      level
        .filter((p) => p.id !== -1) // Remove -1
        .map((p) => ({ ...p, key: filterProps.dependsOn[idx] }))
    )
    .flat();

  const params = new URLSearchParams();

  // Multi-value support for multi-select parents
  flatParents.forEach((p) => {
    if (p.id !== undefined) {
      params.append(`${p.key}Id`, p.id);
    }
  });

  const url = `${endpoint}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
  const data = await res.json();

  return [ALL_OPTION, ...data];
}
