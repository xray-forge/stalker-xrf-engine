/**
 * Stringify provided value to correctly display in logs.
 */
export function stringifyValue(value: unknown): string {
  const references: Array<unknown> = [];
  const replacer = (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (references.includes(value)) {
        return "~circular~";
      }

      references.push(value);
    }

    return value;
  };

  return typeof value === "object" ? JSON.stringify(value, replacer) : String(value);
}
