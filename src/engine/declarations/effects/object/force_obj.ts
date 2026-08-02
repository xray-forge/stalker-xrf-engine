import { GameObject } from "xray16/alias";
import { abort, createVector, extern, Nillable } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getObjectByStoryId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Apply a constant upward force to the object referenced by the provided story ID.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param p - Tuple of target story ID, Nillable force value and Nillable time interval.
 */
extern(
  "xr_effects.force_obj",
  (_: GameObject, __: GameObject, p: [string, Nillable<number>, Nillable<number>]): void => {
    logger.info("Force object");

    const storyObject: Nillable<GameObject> = getObjectByStoryId(p[0]);

    if (!storyObject) {
      abort("Effect 'force_obj' target object does not exist.");
    }

    if (!p[1]) {
      p[1] = 20;
    }

    if (!p[2]) {
      p[2] = 100;
    }

    storyObject.set_const_force(createVector(0, 1, 0), p[1], p[2]);
  }
);
