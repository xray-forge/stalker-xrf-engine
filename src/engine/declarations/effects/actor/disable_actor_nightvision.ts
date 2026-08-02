import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";

/**
 * Disable actor night vision tools.
 */
extern("xr_effects.disable_actor_nightvision", (): void => {
  getManager(ActorInputManager).disableActorNightVision();
});
