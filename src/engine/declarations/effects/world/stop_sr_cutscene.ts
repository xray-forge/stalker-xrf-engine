import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getActiveSchemeState, IBaseSchemeState } from "@/engine/core/schemes/state";

/**
 * Stop object camera effector.
 */
extern("xr_effects.stop_sr_cutscene", (_: GameObject, object: GameObject): void => {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());
  const activeSchemeState: Nillable<IBaseSchemeState> = $isNotNil(state) ? getActiveSchemeState(state) : null;

  if (activeSchemeState?.signals) {
    activeSchemeState.signals.set("cam_effector_stop", true);
  }
});
