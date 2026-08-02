import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern } from "xray16/lib";

/**
 * Whether object has actor as active enemy.
 */
extern("xr_conditions.has_actor_enemy", (_: GameObject, object: GameObject): boolean => {
  return object.best_enemy()?.id() === ACTOR_ID;
});
