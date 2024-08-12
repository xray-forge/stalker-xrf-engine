import { log, print_stack } from "xray16";

import type { AnyArgs, Optional, TCount } from "@/engine/lib/types";

/**
 * Call game abort and print reason.
 * Way to throw exceptions from lua code in x-ray engine.
 *
 * Error message should start with capitalized letter and end with period.
 *
 * @param format - c-like formatted string for interpolation
 * @param rest - rest parameters to interpolate into format string
 */
export function abort(format: string, ...rest: AnyArgs): never {
  const reason: string = string.format(format, ...rest);

  print_stack();
  error(reason, 2);
}

/**
 * Assertion function to ensure provided condition is truthy.
 * Call 'abort' in case of invalid condition.
 *
 * @param condition - condition to call assertion abort
 * @param format - c-like formatted string for interpolation
 * @param rest - rest parameters to interpolate into format string
 */
export function assert<T = boolean>(condition: T, format: string, ...rest: AnyArgs): asserts condition {
  if (!condition) {
    abort(string.format(format, ...rest));
  }
}

/**
 * Assertion function to ensure provided value is not null.
 *
 * @param value - value to check
 * @param format - optional c-like formatted string for interpolation
 * @param rest - rest parameters to interpolate into format string
 */
export function assertDefined<T>(
  value: Optional<T> | undefined,
  format: string = "Type assertion failed, unexpected 'nil' value provided.",
  ...rest: AnyArgs
): asserts value is T {
  if (value === null) {
    abort(string.format(format, ...rest));
  }
}

/**
 * Assertion function to ensure provided value is boolean.
 *
 * @param value - value to check
 * @param format - optional c-like formatted string for interpolation
 * @param rest - rest parameters to interpolate into format string
 */
export function assertNonEmptyString(
  value: Optional<string>,
  format: string = "Type assertion failed, expected boolean value.",
  ...rest: AnyArgs
): asserts value is string {
  if (value === null || value === "") {
    abort(string.format(format, ...rest));
  }
}

/**
 * Print callstack for debugging purposes.
 *
 * @param level - stack levels to print in trace logs
 */
export function callstack(level: TCount = 5): void {
  if (debug !== null) {
    log("[callstack][traceback]" + debug.traceback(level));
  }
}
