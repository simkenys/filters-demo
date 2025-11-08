// utils/fetchFromBackend.js
/**
 * Generic backend fetcher
 */
export async function fetchFromBackend({
  parentValues,
  filterProps,
  endpoint,
}) {
  const flatParents = parentValues
    .map((level, idx) =>
      level.map((p) => ({ ...p, key: filterProps.dependsOn[idx] }))
    )
    .flat();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parents: flatParents }),
  });

  if (!res.ok) throw new Error(`Failed to fetch from ${endpoint}`);
  return res.json();
}
