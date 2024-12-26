/**
 * JSON.stringify alternative for lua data types.
 *
 * @param target - value to stringify as json
 * @param separator - separator of each key-value pair after comma
 * @param depth - current depth of json transformation
 * @param maxDepth - maximal depth to transform, replace with `<depth_limit>` otherwise
 * @param circular - registry of circular items references, return `<depth_limit>``` in case of circular references
 * @returns stringified to json value
 */
export function toJSON(
  target: unknown,
  separator: string = " ",
  depth: number = 0,
  maxDepth: number = 7,
  circular: LuaTable<AnyNotNil, boolean> = new LuaTable()
): string {
  if (depth > maxDepth) {
    return "\"<depth_limit>\"";
  }

  const targetType: string = type(target);

  if (targetType === "string") {
    return `"${target}"`;
  } else if (targetType === "number") {
    return tostring(target);
  } else if (targetType === "nil") {
    return "\"<nil>\"";
  } else if (targetType === "boolean") {
    return tostring(target);
  } else if (targetType === "function") {
    return "\"<function>\"";
  } else if (targetType === "userdata") {
    return "\"<userdata>\"";
  } else if (targetType === "table") {
    if (circular.has(target as AnyNotNil)) {
      return "\"<circular_reference>\"";
    } else {
      circular.set(target as AnyNotNil, true);
    }

    let result: string = "{";
    let index: number = 0;

    for (const [k, v] of pairs(target)) {
      if (index !== 0) {
        result += "," + separator;
      }

      result += string.format(
        "\"%s\": %s",
        stringifyKey(k),
        toJSON(v, separator, depth + 1, maxDepth, circular),
        separator
      );

      index++;
    }

    return result + "}";
  }

  return "\"<unknown>\"";
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
