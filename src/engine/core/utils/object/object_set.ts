import { CSightParams } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { copyVector } from "@/engine/core/utils/vector";
import { ClientObject, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Force object to look at another object.
 *
 * @param object - object to execute look command
 * @param objectToLook - target object to look at
 */
export function setObjectLookAtAnotherObject(object: ClientObject, objectToLook: ClientObject): void {
  const lookPoint: Vector = copyVector(objectToLook.position().sub(object.position()));

  object.set_sight(CSightParams.eSightTypeDirection, lookPoint, 0);
}
