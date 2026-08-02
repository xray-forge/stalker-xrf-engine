import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { StalkerStateController } from "@/engine/core/ai/state";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";

/**
 * Force-reset the object state and animation to the Jupiter b217 nitro straight state.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object whose state controller animation is reset.
 */
extern("xr_effects.jup_b217_hard_animation_reset", (actor: GameObject, object: GameObject): void => {
  const controller: StalkerStateController = registry.objects.get(object.id()).stateController!;

  controller.setState("jup_b217_nitro_straight" as EStalkerState, null, null, null, null);
  controller.animationController.setState(null, true);
  controller.animationController.setState("jup_b217_nitro_straight" as EStalkerState, null);
  controller.animationController.setControl();
});
