/////////////////////////
// POST VERSION

// /**
//  * Generic backend fetcher
//  */
// import { ALL_OPTION } from "../hooks/useFilterConstants";

// export async function fetchFromBackend({
//   parentValues,
//   filterProps,
//   endpoint,
// }) {
//   const flatParents = parentValues
//     .map((level, idx) =>
//       level.map((p) => ({ ...p, key: filterProps.dependsOn[idx] }))
//     )
//     .flat();

//   const res = await fetch(endpoint, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ parents: flatParents }),
//   });

//   if (!res.ok) throw new Error(`Failed to fetch from ${endpoint}`);
//   const data = await res.json();

//   // Always include ALL_OPTION
//   return [ALL_OPTION, ...data];
// }

/////////////////////////////

////////////////////////////
// GET VERSION
import { ALL_OPTION } from "../hooks/useFilterConstants";

export async function fetchFromBackend({
  parentValues,
  filterProps,
  endpoint,
}) {
  // Flatten all selected parents with their keys
  const flatParents = parentValues
    .map((level, idx) =>
      level.map((p) => ({ ...p, key: filterProps.dependsOn[idx] }))
    )
    .flat();

  const params = new URLSearchParams();

  // Append only valid IDs (ignore -1)
  flatParents.forEach((p) => {
    if (p.id !== undefined && p.id !== -1) {
      params.append(`${p.key}Id`, p.id);
    }
  });

  const url = `${endpoint}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
  const data = await res.json();

  // Always include ALL_OPTION
  return [ALL_OPTION, ...data];
}
