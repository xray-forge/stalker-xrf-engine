/**
 * Trim provided string, remove spaces from start and end.
 * todo: Description.
 * todo: use from lua extensions string.trim
 *
 * @param target - string to trim
 * @returns trimmed string
 */
export function trimString(target: string): string {
  const [trimmed] = string.gsub(target, "^%s*(.-)%s*$", "%1");

  return trimmed || "";
}

/**
 * todo;
 *
 * @param target
 * @param sub
 */
export function containsSubstring(target: string, sub: string): boolean {
  target = string.lower(target);
  sub = string.lower(sub);

  return target !== string.gsub(target, sub, "")[0];
}
