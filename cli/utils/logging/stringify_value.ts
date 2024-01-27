/**
 * @param value - any javascript value reference to stringify
 * @returns stringified value to correctly display in logs
 */
export function stringifyValue(value: unknown): string {
  const references: Array<unknown> = [];

  function replacer(key: string, value: unknown): string {
    if (typeof value === "object" && value !== null) {
      if (references.includes(value)) {
        return "~circular~";
      }

      references.push(value);
    }

    return value as string;
  }

  return typeof value === "object" ? JSON.stringify(value, replacer) : String(value);
}
