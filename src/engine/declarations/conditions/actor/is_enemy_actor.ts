import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern } from "xray16/lib";

/**
 * Check whether object enemy is actor.
 */
extern("xr_conditions.is_enemy_actor", (object: GameObject): boolean => {
  return object.id() === ACTOR_ID; // todo: Probably always true. Deprecate?
});
