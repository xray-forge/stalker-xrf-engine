/**
 * Trim provided string, remove spaces from start and end.
 * todo: Description.
 * todo: use from lua extensions string.trim
 */
export function trimString(target: string): string {
  const [trimmed] = string.gsub(target, "^%s*(.-)%s*$", "%1");

  return trimmed || "";
}

/**
 * Explode string by provided separator char.
 * todo: Description.
 */
export function explodeString(target: string, separator: string, trim: boolean): LuaTable<number, string> {
  const result: LuaTable<number, string> = new LuaTable();
  let [cpt] = string.find(target, separator, 1, true);

  while (cpt !== null) {
    if (trim) {
      table.insert(result, trimString(string.sub(target, 1, cpt - 1)));
    } else {
      table.insert(result, string.sub(target, 1, cpt - 1));
    }

    target = string.sub(target, cpt + string.len(separator));
    [cpt] = string.find(target, separator, 1, true);
  }

  if (trim) {
    table.insert(result, trimString(target));
  } else {
    table.insert(result, target);
  }

  return result;
}
