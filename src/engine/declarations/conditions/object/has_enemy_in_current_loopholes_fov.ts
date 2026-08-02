import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Check if object has any enemies in current loophole field of view.
 */
extern("xr_conditions.has_enemy_in_current_loopholes_fov", (_: GameObject, object: GameObject): boolean => {
  return (
    object.in_smart_cover() &&
    $isNotNil(object.best_enemy()) &&
    object.in_current_loophole_fov(object.best_enemy()!.position())
  );
});
