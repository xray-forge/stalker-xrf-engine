import { GameObject } from "xray16/alias";
import { extern, Nillable, TLabel, TSection } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";

/**
 * Set the surge notification message and Nillablely the surge task.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param label - Label used as the surge notification message.
 * @param task - Nillable task section assigned for the surge.
 */
extern(
  "xr_effects.set_surge_mess_and_task",
  (_: GameObject, __: GameObject, [label, task]: [TLabel, Nillable<TSection>]): void => {
    const surgeManager: SurgeManager = getManager(SurgeManager);

    surgeManager.setSurgeMessage(label);

    if (task) {
      surgeManager.setSurgeTask(task);
    }
  }
);
