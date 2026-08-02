import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Check if object has any pistol in pistol slot (`1`).
 */
extern("xr_conditions.best_pistol", (_: GameObject, object: GameObject): boolean => {
  return $isNotNil(object.item_in_slot(1));
});
