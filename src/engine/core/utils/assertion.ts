import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyArgs, Optional, TCount } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Call game abort and print reason.
 * Way to throw exceptions from lua code in x-ray engine.
 *
 * @param format - c-like formatted string for interpolation
 * @param rest - rest parameters to interpolate into format string
 */
export function abort(format: string, ...rest: AnyArgs): never {
  const reason: string = string.format(format, ...rest);

  logger.error("[abort] Aborting:", reason);
  logger.printStack();

  error(reason, 1);
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
export function assertBoolean(
  value: unknown,
  format: string = "Type assertion failed, expected boolean value.",
  ...rest: AnyArgs
): asserts value is boolean {
  if (type(value) !== "boolean") {
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
    logger.info("[callstack][traceback]", debug.traceback(level));
  }
}
