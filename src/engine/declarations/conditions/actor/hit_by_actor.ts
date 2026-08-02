import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern, Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Check if object is hit by actor.
 */
extern("xr_conditions.hit_by_actor", (_: GameObject, object: GameObject): boolean => {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());

  return $isNotNil(state) ? getSchemeState(state, EScheme.HIT)?.who === ACTOR_ID : false;
});
