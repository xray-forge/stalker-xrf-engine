import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";

/**
 * Disable game UI for actor.
 */
extern("xr_effects.disable_ui_only", (): void => {
  getManager(ActorInputManager).disableGameUiOnly();
});
