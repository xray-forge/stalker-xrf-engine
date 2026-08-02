import { device, level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, Nillable, TName, TNumberId, TRate } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";
import { postProcessState } from "@/engine/declarations/effects/post_process/shared";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Add global effector based on name / id / fov parameters.
 */
extern(
  "xr_effects.run_cam_effector_global",
  (_: GameObject, object: GameObject, [name, id, fov]: [TName, Nillable<TNumberId>, Nillable<TRate>]): void => {
    logger.info("Run cam effector global");

    level.add_cam_effector2(
      `camera_effects\\${name}.anm`,
      id && type(id) === "number" && id > 0 ? id : 1000 + math.random(100),
      false,
      "xr_effects.cam_effector_callback",
      fov && type(fov) === "number" ? fov : device().fov
    );

    postProcessState.camEffectorPlayingObjectId = object.id();
  }
);
