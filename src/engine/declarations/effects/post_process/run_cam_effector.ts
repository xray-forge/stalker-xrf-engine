import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, Nillable, TName, TNumberId, TRUE, TStringifiedBoolean } from "xray16/lib";

import { logger, postProcessState } from "./shared";

/**
 * Run camera effector by provided name/id/loop.
 * Stores latest effector playing object id in global data.
 */
extern(
  "xr_effects.run_cam_effector",
  (
    _: GameObject,
    object: GameObject,
    [name, idParameter, loopParameter]: [Nillable<TName>, Nillable<TNumberId>, Nillable<TStringifiedBoolean>]
  ): void => {
    logger.info("Run cam effector");

    if (!name) {
      return;
    }

    level.add_cam_effector(
      `camera_effects\\${name}.anm`,
      idParameter && type(idParameter) === "number" && idParameter > 0 ? idParameter : 1000 + math.random(100),
      loopParameter === TRUE,
      "xr_effects.cam_effector_callback"
    );

    postProcessState.camEffectorPlayingObjectId = object.id();
  }
);
