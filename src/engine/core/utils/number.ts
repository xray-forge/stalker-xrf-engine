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

/**
 * todo: description
 */
export function pickRandom<T>(...args: Array<T>): T {
  return args[math.random(0, args.length - 1)];
}

/**
 * todo: description
 */
export function round(value: number): number {
  const min: number = math.floor(value);
  const max: number = min + 1;

  return value - min >= max - value ? max : min;
}

/**
 * todo: description
 * todo: Probably unused
 */
export function add(x: number): boolean {
  return math.floor(x * 0.5) * 2 === math.floor(x);
}
