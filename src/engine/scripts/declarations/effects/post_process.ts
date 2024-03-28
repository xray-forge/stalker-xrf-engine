import { device, level } from "xray16";

import { IRegistryObjectState, registry, SYSTEM_INI } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, Optional, TName, TNumberId, TRate, TStringifiedBoolean } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

let camEffectorPlayingObjectId: Optional<TNumberId> = null;

/**
 * Run camera effector by provided name/id/loop.
 * Stores latest effector playing object id in global data.
 */
extern(
  "xr_effects.run_cam_effector",
  (
    _: GameObject,
    object: GameObject,
    [name, idParameter, loopParameter]: [Optional<TName>, Optional<TNumberId>, Optional<TStringifiedBoolean>]
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

    camEffectorPlayingObjectId = object.id();
  }
);

/**
 * Remove camera effector by provided effector ID.
 */
extern("xr_effects.stop_cam_effector", (_: GameObject, __: GameObject, [effectorId]: [Optional<TNumberId>]): void => {
  logger.info("Stop cam effector: %s", effectorId);

  if (effectorId && type(effectorId) === "number" && effectorId > 0) {
    level.remove_cam_effector(effectorId);
  }
});

/**
 * Add global effector based on name / id / fov parameters.
 */
extern(
  "xr_effects.run_cam_effector_global",
  (_: GameObject, object: GameObject, [name, id, fov]: [TName, Optional<TNumberId>, Optional<TRate>]): void => {
    logger.info("Run cam effector global");

    level.add_cam_effector2(
      `camera_effects\\${name}.anm`,
      id && type(id) === "number" && id > 0 ? id : 1000 + math.random(100),
      false,
      "xr_effects.cam_effector_callback",
      fov && type(fov) === "number" ? fov : device().fov
    );

    camEffectorPlayingObjectId = object.id();
  }
);

/**
 * Callback for camera effects handling.
 * Sets signal for latest played effector logics.
 */
extern("xr_effects.cam_effector_callback", (): void => {
  logger.info("Run cam effector callback");

  if (!camEffectorPlayingObjectId) {
    return;
  }

  const state: IRegistryObjectState = registry.objects.get(camEffectorPlayingObjectId);

  if (!state || !state.activeScheme || !state[state.activeScheme]!.signals) {
    return;
  }

  state[state.activeScheme!]!.signals!.set("cameff_end", true);

  // todo: probably reset playing object ID global and move it out.
});

/**
 * Run complex effector by name (section) and optional ID override parameter.
 */
extern(
  "xr_effects.run_postprocess",
  (_: GameObject, __: GameObject, [name, id]: [Optional<TName>, Optional<TNumberId>]): void => {
    logger.info("Run postprocess");

    if (!name) {
      return;
    }

    if (SYSTEM_INI.section_exist(name)) {
      level.add_complex_effector(name, id && type(id) === "number" && id > 0 ? id : 2000 + math.random(100));
    } else {
      abort("Complex effector section does not exist in system ini: '%s'.", name);
    }
  }
);

/**
 * Stop complex effector by provided ID.
 */
extern("xr_effects.stop_postprocess", (_: GameObject, __: GameObject, [effectorId]: [Optional<TNumberId>]): void => {
  logger.info("Stop postprocess: %s", effectorId);

  if (effectorId && type(effectorId) === "number" && effectorId > 0) {
    level.remove_complex_effector(effectorId);
  }
});
