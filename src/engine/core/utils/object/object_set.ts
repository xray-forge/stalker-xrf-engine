import { CSightParams } from "xray16";
import { GameObject, Vector } from "xray16/alias";

import { copyVector } from "@/engine/core/utils/vector";

/**
 * Force object to look at another object.
 *
 * @param object - Object to execute look command.
 * @param target - Target object to look at.
 */
export function setObjectLookAtAnotherObject(object: GameObject, target: GameObject): void {
  const lookPoint: Vector = copyVector(target.position().sub(object.position()));

  object.set_sight(CSightParams.eSightTypeDirection, lookPoint, 0);
}
