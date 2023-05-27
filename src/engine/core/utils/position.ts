import { CSightParams, move } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { copyVector } from "@/engine/core/utils/vector";
import { ClientObject, Patrol, TDistance, TIndex, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function isStalkerAtWaypoint(object: ClientObject, patrolPath: Patrol, pathPointIndex: TIndex): boolean {
  const objectPosition: Vector = object.position();
  const distance: TDistance = objectPosition.distance_to_sqr(patrolPath.point(pathPointIndex));

  return distance <= 0.13;
}

/**
 * todo;
 */
export function stalkerStopMovement(object: ClientObject): void {
  object.set_movement_type(move.stand);
}

/**
 * todo;
 */
export function stalkerLookAtStalker(object: ClientObject, objectToLook: ClientObject): void {
  const lookPoint: Vector = copyVector(objectToLook.position().sub(object.position()));

  object.set_sight(CSightParams.eSightTypeDirection, lookPoint, 0);
}
