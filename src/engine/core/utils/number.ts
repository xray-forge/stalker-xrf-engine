import { assert } from "@/engine/core/utils/assertion";

/**
 * todo;
 */
export function clampNumber(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}

/**
 * Get math random based chance to happen by base of provided parameter.
 * By default, calculates 'rate' of 100.
 *
 * @param rate - chance to happen
 * @param base - chance base
 * @returns whether thing should happen
 */
export function chance(rate: number, base: number = 100): boolean {
  assert(base > 0 && base >= rate, "Expected chance to be smaller than 'of' value, got '%s' of '%s'.", rate, base);

  return rate >= math.random(base);
}
