import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, Nillable, TNumberId } from "xray16/lib";

import { logger } from "./shared";

/**
 * Remove camera effector by provided effector ID.
 */
extern("xr_effects.stop_cam_effector", (_: GameObject, __: GameObject, [effectorId]: [Nillable<TNumberId>]): void => {
  logger.info("Stop cam effector: %s", effectorId);

  if (effectorId && type(effectorId) === "number" && effectorId > 0) {
    level.remove_cam_effector(effectorId);
  }
});
