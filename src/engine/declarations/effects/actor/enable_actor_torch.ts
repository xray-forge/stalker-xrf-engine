import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";

/**
 * Enable actor torch.
 */
extern("xr_effects.enable_actor_torch", (_: GameObject): void => {
  getManager(ActorInputManager).enableActorTorch();
});
