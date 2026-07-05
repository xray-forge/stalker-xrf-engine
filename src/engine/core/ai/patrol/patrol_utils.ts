import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { Nillable, TName, TNumberId } from "xray16/lib";

import { patrolConfig } from "@/engine/core/ai/patrol/PatrolConfig";

/**
 * Check whether patrol team is synchronized.
 * Used to wait before signals for all patrol members to join waypoint.
 *
 * Note: dead/offline objects are excluded from sync check.
 *
 * @param teamName - Optional team name to check for sync state.
 * @returns Whether all patrol team participants are synchronized.
 */
export function isPatrolTeamSynchronized(teamName: Nillable<TName>): boolean {
  if (!teamName) {
    return true;
  }

  const state: Nillable<LuaTable<TNumberId, boolean>> = patrolConfig.PATROL_TEAMS.get(teamName);

  if (!state) {
    return true;
  }

  for (const [id, isFlagged] of state) {
    // todo: Probably use registry to get object for checking without engine access.
    const object: Nillable<GameObject> = level.object_by_id(id);

    // Check sync stat of the object if it is online and alive.
    if (object && object.alive()) {
      if (!isFlagged) {
        return false;
      }
    } else {
      // Delete objects that cannot be synchronized.
      patrolConfig.PATROL_TEAMS.get(teamName).delete(id);
    }
  }

  return true;
}
