import { CSightParams, move, vector, XR_game_object, XR_patrol, XR_vector } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { TDistance, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function isStalkerAtWaypoint(stalker: XR_game_object, patrol_path: XR_patrol, path_point: TNumberId): boolean {
  const stalker_pos: XR_vector = stalker.position();
  const distance: TDistance = stalker_pos.distance_to_sqr(patrol_path.point(path_point));

  return distance <= 0.13;
}

/**
 * todo;
 */
export function stalkerStopMovement(object: XR_game_object): void {
  object.set_movement_type(move.stand);
}

/**
 * todo;
 */
export function stalkerLookAtStalker(object: XR_game_object, objectToLook: XR_game_object): void {
  const lookPoint: XR_vector = new vector().set(objectToLook.position().sub(object.position()));

  object.set_sight(CSightParams.eSightTypeDirection, lookPoint, 0);
}
