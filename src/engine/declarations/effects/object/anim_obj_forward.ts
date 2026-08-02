import { GameObject } from "xray16/alias";
import { extern, TName } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Process forward animation for provided doors.
 */
extern("xr_effects.anim_obj_forward", (_: GameObject, __: GameObject, doors: Array<TName>): void => {
  for (const [, doorName] of ipairs(doors)) {
    registry.doors.get(doorName).startAnimation(true);
  }
});
