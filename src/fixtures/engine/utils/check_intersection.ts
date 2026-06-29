/**
 * Assert intersection of two arrays.
 *
 * @param target - Array to check.
 * @param expected - Array with expected values.
 */
export function assertArraysIntersecting(target: Array<unknown>, expected: Array<unknown>): void {
  target.forEach((it) => {
    if (!expected.includes(it)) {
      throw new Error(`Error, expected second list to have '${it}'.`);
    }
  });

  expected.forEach((it) => {
    if (!target.includes(it)) {
      throw new Error(`Error, expected first list to have '${it}'.`);
    }
  });
}
