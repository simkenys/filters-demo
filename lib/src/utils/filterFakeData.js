import { ALL_OPTION } from "../hooks/useFilterConstants";

export function filterFakeData(data, flatParents) {
  let filtered = data;
  const grouped = flatParents.reduce((acc, p) => {
    if (!acc[p.key]) acc[p.key] = [];
    acc[p.key].push(p);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([key, parents]) => {
    if (parents.some((p) => p.id === -1)) return;
    const ids = parents.map((p) => p.id);
    filtered = filtered.filter((item) => ids.includes(item[`${key}Id`]));
  });

  return [ALL_OPTION, ...filtered];
}
