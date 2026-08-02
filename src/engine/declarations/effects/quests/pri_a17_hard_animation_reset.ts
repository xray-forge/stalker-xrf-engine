import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { StalkerStateController } from "@/engine/core/ai/state";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";

/**
 * Force-reset the object state and animation to the Pripyat a17 fall down state.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object whose state controller animation is reset.
 */
extern("xr_effects.pri_a17_hard_animation_reset", (actor: GameObject, object: GameObject): void => {
  const controller: StalkerStateController = registry.objects.get(object.id()).stateController!;

  controller.setState("pri_a17_fall_down" as EStalkerState, null, null, null, null);
  controller.animationController.setState(null, true);
  controller.animationController.setState("pri_a17_fall_down" as EStalkerState, null);
  controller.animationController.setControl();
});
