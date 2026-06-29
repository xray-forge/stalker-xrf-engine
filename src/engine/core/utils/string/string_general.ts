/**
 * Trim provided string, remove spaces from start and end.
 * Todo: Description.
 * Todo: use from lua extensions string.trim.
 *
 * @param target - String to trim.
 * @returns Trimmed string.
 */
export function trimString(target: string): string {
  const [trimmed] = string.gsub(target, "^%s*(.-)%s*$", "%1");

  return trimmed || "";
}

/**
 * @param target - Target string to check in.
 * @param substring - String part to check in target.
 * @returns Whether target string contains substring.
 */
export function containsSubstring(target: string, substring: string): boolean {
  target = string.lower(target);
  substring = string.lower(substring);

  return target !== string.gsub(target, substring, "")[0];
}
