import { TRate } from "@/engine/lib/types";

/**
 * Calculate interpolated sound fade volume for a progress factor, clamped between the two fade volumes.
 *
 * @param factor - Current fade progress factor.
 * @param startPoint - Progress factor at which fading starts.
 * @param stopPoint - Progress factor at which fading stops.
 * @param fade1Volume - Volume at the start point of the fade.
 * @param fade2Volume - Volume at the stop point of the fade.
 * @returns Interpolated volume clamped to the range between the two fade volumes.
 */
export function calculateSoundFade(
  factor: TRate,
  startPoint: TRate,
  stopPoint: TRate,
  fade1Volume: number,
  fade2Volume: number
): number {
  let minVol: TRate;
  let maxVol: TRate;

  if (fade1Volume > fade2Volume) {
    maxVol = fade1Volume;
    minVol = fade2Volume;
  } else {
    maxVol = fade2Volume;
    minVol = fade1Volume;
  }

  const fade: TRate = ((factor - startPoint) * (fade2Volume - fade1Volume)) / (stopPoint - startPoint) + fade1Volume;

  if (fade > maxVol) {
    return maxVol;
  } else if (fade < minVol) {
    return minVol;
  } else {
    return fade;
  }
}
