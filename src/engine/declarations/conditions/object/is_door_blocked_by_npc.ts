import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Check if door object is blocked by NPC.
 */
extern("xr_conditions.is_door_blocked_by_npc", (_: GameObject, object: GameObject): boolean => {
  return object.is_door_blocked_by_npc();
});
