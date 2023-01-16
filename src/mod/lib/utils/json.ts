export function stringifyAsJson(target: unknown, separator: string = " "): string {
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
      result += string.format("\"%s\": %s,%s", k, stringifyAsJson(v, separator), separator);
    }

    return result + "}";
  }

  return "<unknown>";
}
