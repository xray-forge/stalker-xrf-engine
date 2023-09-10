import { level } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { ActorInputManager } from "@/engine/core/managers/actor/ActorInputManager";
import { animations } from "@/engine/lib/constants/animation";
import { ClientObject, EActiveItemSlot, Optional } from "@/engine/lib/types";

/**
 * Punch actor as object.
 *
 * @param object - client object that should hit actor
 */
export function objectPunchActor(object: ClientObject): void {
  const actor: ClientObject = registry.actor;

  // Too far to hit.
  if (actor.position().distance_to_sqr(object.position()) > 4) {
    return;
  }

  ActorInputManager.getInstance().setInactiveInputTime(30);
  level.add_cam_effector(animations.camera_effects_fusker, 999, false, "");

  const activeSlot: EActiveItemSlot = actor.active_slot();

  if (activeSlot === EActiveItemSlot.PRIMARY || activeSlot === EActiveItemSlot.SECONDARY) {
    const activeItem: Optional<ClientObject> = actor.active_item();

    if (activeItem) {
      actor.drop_item(activeItem);
    }
  }
}
