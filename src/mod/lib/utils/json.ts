export function stringifyAsJson(
  target: unknown,
  separator: string = " ",
  depth: number = 0,
  maxDepth: number = 6
): string {
  if (depth >= maxDepth) {
    return "<stack_limit>";
  }

  if (type(target) === "string") {
    return `"${target}"`;
  } else if (type(target) === "number") {
    return tostring(target);
  } else if (type(target) === "nil") {
    return "<nil>";
  } else if (type(target) === "boolean") {
    return tostring(target);
  } else if (type(target) === "function") {
    return "<function>";
  } else if (type(target) === "userdata") {
    return "<userdata>";
  } else if (type(target) === "table") {
    let result: string = "{";

    for (const [k, v] of pairs(target)) {
      result += string.format("\"%s\": %s,%s", k, stringifyAsJson(v, separator, depth + 1, maxDepth), separator);
    }

    return result + "}";
  }

  return "<unknown>";
}
