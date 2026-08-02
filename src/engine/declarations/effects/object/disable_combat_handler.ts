import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getSchemeStateOptimistic, hasSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Disable the combat and monster combat schemes for the object.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object whose combat handlers are disabled.
 */
extern("xr_effects.disable_combat_handler", (_: GameObject, object: GameObject): void => {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (hasSchemeState(state, EScheme.COMBAT)) {
    getSchemeStateOptimistic(state, EScheme.COMBAT).enabled = false;
  }

  if (hasSchemeState(state, EScheme.MOB_COMBAT)) {
    getSchemeStateOptimistic(state, EScheme.MOB_COMBAT).enabled = false;
  }
});
