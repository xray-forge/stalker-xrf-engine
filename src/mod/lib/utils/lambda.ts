/**
 * Shortcut for prettier self-invocable functions.
 */
export function inline<T>(cb: () => T): T {
  return cb();
}
