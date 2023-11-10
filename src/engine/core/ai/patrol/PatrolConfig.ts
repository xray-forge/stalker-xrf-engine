import { EStalkerState } from "@/engine/core/animation/types";
import { TName, TNumberId } from "@/engine/lib/types";

export const patrolConfig = {
  DEFAULT_PATROL_WAIT_TIME: 10_000,
  DEFAULT_PATROL_STATE_STANDING: EStalkerState.GUARD,
  DEFAULT_PATROL_STATE_MOVING: EStalkerState.PATROL,
  // When cannot keep with patrol state, persist state for a while and then switch walk/run/sprint based on distance.
  KEEP_STATE_DURATION: 1500,
  // Minimal time to walk before checking whether state can switch.
  WALK_STATE_DURATION: 3000,
  // Minimal time to run before checking whether state can switch.
  RUN_STATE_DURATION: 2000,
  DISTANCE_TO_WALK_SQR: 10 * 10, // Distances to coordinate current walk movement
  DISTANCE_TO_RUN_SQR: 50 * 50, // Distances to coordinate current run movement
  /**
   * List of synchronization groups for game patrols.
   * Related to stalkers patrol manager.
   */
  PATROL_TEAMS: new LuaTable<TName, LuaTable<TNumberId, boolean>>(),
};
