/* eslint sort-keys-fix/sort-keys-fix: "error" */

import type { LuaArray } from "@/engine/lib/types";

/**
 * Game detector items sections.
 */
export const detectors = {
  detector_advanced: "detector_advanced",
  detector_elite: "detector_elite",
  detector_scientific: "detector_scientific",
  detector_simple: "detector_simple",
} as const;

/**
 * Detectors map typing.
 */
export type TDetectors = typeof detectors;

/**
 * One of detectors typing.
 */
export type TDetector = TDetectors[keyof TDetectors];

/**
 * Order of detectors from worse to best.
 */
export const detectorsOrder: LuaArray<TDetector> = $fromArray<TDetector>([
  detectors.detector_simple,
  detectors.detector_advanced,
  detectors.detector_elite,
  detectors.detector_scientific,
]);
