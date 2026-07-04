import { $fromArray } from "xray16/macros";

import { assert } from "@/engine/core/utils/assertion";

/**
 * Get math random based chance to happen by base of provided parameter.
 * By default, calculates 'rate' of 100.
 *
 * @param rate - Chance to happen (0 - base).
 * @param base - Chance base.
 * @returns Whether thing should happen.
 */
export function chance(rate: number, base: number = 100): boolean {
  return rate >= math.random(base);
}

/**
 * Get math random between provided boundaries.
 * Works with floating point numbers in contrast to default math.random lua library.
 *
 * @param from - Minimal value.
 * @param to - Maximal value.
 * @returns Floating point number between provided boundaries.
 */
export function between(from: number, to: number): number {
  assert(from < to, "Expected range to be correct in 'between' util, %s > %s.", from, to);

  return from + math.random() * (to - from);
}

/**
 * Pick one of parameters.
 *
 * @param args - List of arguments to pick from.
 * @returns One of args based on random choice.
 */
export function pickRandom<T>(...args: Array<T>): T {
  return $fromArray(args).get(math.random(1, args.length));
}
