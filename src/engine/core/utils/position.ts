import { CSightParams, game_object, move, patrol, vector } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { TDistance, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function isStalkerAtWaypoint(stalker: game_object, patrol_path: patrol, path_point: TNumberId): boolean {
  const stalker_pos: vector = stalker.position();
  const distance: TDistance = stalker_pos.distance_to_sqr(patrol_path.point(path_point));

  return distance <= 0.13;
}

/**
 * todo;
 */
export function stalkerStopMovement(object: game_object): void {
  object.set_movement_type(move.stand);
}

/**
 * todo;
 */
export function stalkerLookAtStalker(object: game_object, objectToLook: game_object): void {
  const lookPoint: vector = new vector().set(objectToLook.position().sub(object.position()));

  object.set_sight(CSightParams.eSightTypeDirection, lookPoint, 0);
}
