import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, Nillable, TNumberId } from "xray16/lib";

import { logger } from "./shared";

/**
 * Stop complex effector by provided ID.
 */
extern("xr_effects.stop_postprocess", (_: GameObject, __: GameObject, [effectorId]: [Nillable<TNumberId>]): void => {
  logger.info("Stop postprocess: %s", effectorId);

  if (effectorId && type(effectorId) === "number" && effectorId > 0) {
    level.remove_complex_effector(effectorId);
  }
});
