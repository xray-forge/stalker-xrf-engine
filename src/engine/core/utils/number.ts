import { TIndex } from "@/engine/lib/types";

/**
 * Clamp number to limits.
 *
 * @param value - Target number value.
 * @param min - Minimal bound.
 * @param max - Maximal bound.
 * @returns Clamped to provided bounds number.
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
 * @param value - Target number to round.
 * @returns Rounded integer.
 */
export function round(value: number): number {
  const min: number = math.floor(value);
  const max: number = min + 1;

  return value - min >= max - value ? max : min;
}

/**
 * Round value with precision.
 *
 * @param value - Target number to round.
 * @param precision - Target precision to round.
 * @returns Rounded integer.
 */
export function roundWithPrecision(value: number, precision?: number): number {
  const magnitude: number = Math.pow(10, precision ?? 0);

  return value >= 0 ? math.floor(magnitude * value + 0.5) / magnitude : math.ceil(magnitude * value - 0.5) / magnitude;
}

/**
 * Range util for easier lambda iteration over specified number ranges.
 *
 * @param size - Size of rage.
 * @param startAt - First value in range.
 */
export function range(size: number, startAt: number = 0): ReadonlyArray<number> {
  return [...Array(size)].map((it: TIndex, index) => index + startAt);
}
