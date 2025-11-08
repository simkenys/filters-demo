/**
 * Flattens parentValues (array of arrays) and adds `key` based on filterProps.dependsOn.
 * @param {Array} parentValues - Array of arrays of objects.
 * @param {Object} filterProps - Filter object with dependsOn array.
 * @returns {Array} Flattened array with added `key` field.
 */
export function flattenWithDependsOn(parentValues, filterProps) {
  return parentValues.flatMap((items, i) => {
    // Use dependsOn[i] as the key
    const key = filterProps.dependsOn[i] || `key${i}`;

    return items.map((item) => ({ ...item, key }));
  });
}
