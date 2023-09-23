/* eslint sort-keys-fix/sort-keys-fix: "error" */

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
export const detectorsOrder = {
  1: detectors.detector_simple,
  2: detectors.detector_advanced,
  3: detectors.detector_elite,
  4: detectors.detector_scientific,
} as const;
