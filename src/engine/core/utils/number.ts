import { TIndex } from "@/engine/lib/types";

/**
 * Clamp number to limits.
 *
 * @param value - target number value
 * @param min - minimal bound
 * @param max - maximal bound
 * @returns clamped to provided bounds number
 */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}

/**
 * Round value.
 *
 * @param value - target number to round
 * @returns rounded integer
 */
export function round(value: number): number {
  const min: number = math.floor(value);
  const max: number = min + 1;

  return value - min >= max - value ? max : min;
}

/**
 * Range util for easier lambda iteration over specified number ranges.
 *
 * @param size - size of rage
 * @param startAt - first value in range
 */
export function range(size: number, startAt: number = 0): ReadonlyArray<number> {
  return [...Array(size)].map((it: TIndex, index) => index + startAt);
}
