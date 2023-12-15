import { level } from "xray16";

import { getManager } from "@/engine/core/database";
import { registry } from "@/engine/core/database/registry";
import { ActorInputManager } from "@/engine/core/managers/actor/ActorInputManager";
import { animations } from "@/engine/lib/constants/animation";
import { GameObject } from "@/engine/lib/types";

/**
 * Punch actor as object.
 *
 * @param object - game object that should hit actor
 */
export function objectPunchActor(object: GameObject): void {
  // Too far to hit.
  if (registry.actor.position().distance_to_sqr(object.position()) > 4) {
    return;
  }

  getManager(ActorInputManager).setInactiveInputTime(30);

  level.add_cam_effector(animations.camera_effects_fusker, 999, false, "");
}
