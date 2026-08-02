import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getSchemeStateOptimistic, hasSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Disable the combat ignore scheme for the object.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object whose combat ignore handler is disabled.
 */
extern("xr_effects.disable_combat_ignore_handler", (_: GameObject, object: GameObject): void => {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (hasSchemeState(state, EScheme.COMBAT_IGNORE)) {
    getSchemeStateOptimistic(state, EScheme.COMBAT_IGNORE).enabled = false;
  }
});
