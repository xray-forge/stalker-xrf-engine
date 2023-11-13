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
 * @param target - target string to check in
 * @param substring - string part to check in target
 * @returns whether target string contains substring
 */
export function containsSubstring(target: string, substring: string): boolean {
  target = string.lower(target);
  substring = string.lower(substring);

  return target !== string.gsub(target, substring, "")[0];
}
