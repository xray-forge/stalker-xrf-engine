import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

/**
 * Whether object has enemy and see it.
 */
extern("xr_conditions.see_enemy", (_: GameObject, object: GameObject): boolean => {
  const enemy: Nillable<GameObject> = object.best_enemy();

  if (enemy) {
    return object.see(enemy);
  }

  return false;
});
