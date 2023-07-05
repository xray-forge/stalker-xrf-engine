import { assert } from "@/engine/core/utils/assertion";

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
 * Pick one of parameters.
 *
 * @param args - list of arguments to pick from
 * @returns one of args based on random choice
 */
export function pickRandom<T>(...args: Array<T>): T {
  return $fromArray(args).get(math.random(1, args.length));
}
