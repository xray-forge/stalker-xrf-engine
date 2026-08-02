import { GameObject } from "xray16/alias";
import { extern, TRUE, TStringifiedBoolean } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";

/**
 * Enable actor UI.
 * Effect parameter describes whether slot should be restored - `true` by default.
 */
extern("xr_effects.enable_ui", (_: GameObject, __: GameObject, [preserveSlot]: [TStringifiedBoolean]): void => {
  getManager(ActorInputManager).enableGameUi(preserveSlot !== TRUE);
});
