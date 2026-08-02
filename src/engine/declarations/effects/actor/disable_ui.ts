import { GameObject } from "xray16/alias";
import { extern, TRUE, TStringifiedBoolean } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";

/**
 * Disable game UI for actor and reset active item slot.
 */
extern("xr_effects.disable_ui", (_: GameObject, __: GameObject, [preserveSlot]: [TStringifiedBoolean]): void => {
  getManager(ActorInputManager).disableGameUi(preserveSlot !== TRUE);
});
