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
  let f: TRate = ((factor - startPoint) * (fade2Volume - fade1Volume)) / (stopPoint - startPoint) + fade1Volume;

  let minVol: TRate = 0.0;
  let maxVol: TRate = 1.0;

  if (fade1Volume > fade2Volume) {
    maxVol = fade1Volume;
    minVol = fade2Volume;
  } else {
    maxVol = fade2Volume;
    minVol = fade1Volume;
  }

  if (f > maxVol) {
    f = maxVol;
  } else if (f < minVol) {
    f = minVol;
  }

  return f;
}
