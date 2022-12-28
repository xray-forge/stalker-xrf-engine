import { CSightParams, move, vector, XR_game_object, XR_patrol, XR_vector } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/world");

/**
 * todo;
 */
export function isStalkerAtWaypoint(stalker: XR_game_object, patrol_path: XR_patrol, path_point: number): boolean {
  const stalker_pos: XR_vector = stalker.position();
  const distance: number = stalker_pos.distance_to_sqr(patrol_path.point(path_point));

  return distance <= 0.13;
}

/**
 * todo;
 */
export function stalkerStop(stalker: XR_game_object): void {
  stalker.set_movement_type(move.stand);
}

/**
 *  function exports.stalker_look_at_stalker(stalker, whom)
 *  local look_pt = this.vector_copy_by_val(whom:position()):sub(stalker:position())
 *  stalker:set_sight(look.direction, look_pt, 0)
 *  end
 */
export function stalkerLookAtStalker(stalker: XR_game_object, whom: XR_game_object): void {
  const look_pt = new vector().set(whom.position().sub(stalker.position()));

  stalker.set_sight(CSightParams.eSightTypeDirection, look_pt, 0);
}
