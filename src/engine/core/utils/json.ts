/**
 * JSON.stringify alternative for lua data types.
 */
export function stringifyAsJson(
  target: unknown,
  separator: string = " ",
  depth: number = 0,
  maxDepth: number = 7
): string {
  if (depth >= maxDepth) {
    return "<depth_limit>";
  }

  const targetType: string = type(target);

  if (targetType === "string") {
    return `"${target}"`;
  } else if (targetType === "number") {
    return tostring(target);
  } else if (targetType === "nil") {
    return "<nil>";
  } else if (targetType === "boolean") {
    return `<bool: ${target === true ? "true" : "false"}>`;
  } else if (targetType === "function") {
    return "<function>";
  } else if (targetType === "userdata") {
    return "<userdata>";
  } else if (targetType === "table") {
    let result: string = "{";

    for (const [k, v] of pairs(target)) {
      result += string.format(
        "\"%s\": %s,%s",
        stringifyKey(k),
        stringifyAsJson(v, separator, depth + 1, maxDepth),
        separator
      );
    }

    return result + "}";
  }

  return "<unknown>";
}

/**
 * Key stringify.
 */
export function stringifyKey(target: unknown): string {
  const targetType: string = type(target);

  if (targetType === "string" || targetType === "number") {
    return tostring(target);
  } else {
    return string.format("<k_%s>", targetType);
  }
}
