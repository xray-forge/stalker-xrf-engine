import { TRate } from "@/engine/lib/types";

/**
 * todo;
 *
 * @param factor
 * @param startPoint
 * @param stopPoint
 * @param fade1Volume
 * @param fade2Volume
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
