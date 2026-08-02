import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Whether object has active enemy.
 */
extern("xr_conditions.mob_has_enemy", (_: GameObject, object: GameObject): boolean => {
  return $isNotNil(object.get_enemy());
});
