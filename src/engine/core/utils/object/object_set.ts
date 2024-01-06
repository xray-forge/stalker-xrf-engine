import { CSightParams } from "xray16";

import { copyVector } from "@/engine/core/utils/vector";
import { GameObject, Vector } from "@/engine/lib/types";

/**
 * Force object to look at another object.
 *
 * @param object - object to execute look command
 * @param target - target object to look at
 */
export function setObjectLookAtAnotherObject(object: GameObject, target: GameObject): void {
  const lookPoint: Vector = copyVector(target.position().sub(object.position()));

  object.set_sight(CSightParams.eSightTypeDirection, lookPoint, 0);
}
