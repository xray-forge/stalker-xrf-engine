import { GameObject } from "xray16/alias";
import { extern, Nillable, TName } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getActiveSchemeState } from "@/engine/core/schemes/state";

/**
 * Check if provided scheme signal is active.
 *
 * Where:
 * - name - signal name to check.
 */
extern("xr_conditions.signal", (_: GameObject, object: GameObject, [name]: [TName]): boolean => {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const signals: Nillable<LuaTable<TName, boolean>> = getActiveSchemeState(state)?.signals;

  return $isNotNil(signals) && signals.get(name) === true;
});
