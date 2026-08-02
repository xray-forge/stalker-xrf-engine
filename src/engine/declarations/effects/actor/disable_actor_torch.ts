import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";

/**
 * Disable actor torch.
 */
extern("xr_effects.disable_actor_torch", (_: GameObject): void => {
  getManager(ActorInputManager).disableActorTorch();
});
