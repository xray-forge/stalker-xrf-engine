import { EGameObjectRelation, GameObject } from "xray16/alias";
import { ACTOR_ID, extern, Nillable } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { getSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Check whether object has enemy relations with actor.
 */
extern("xr_conditions.actor_enemy", (actor: GameObject, object: GameObject): boolean => {
  const state: Nillable<ISchemeDeathState> = getSchemeState(registry.objects.get(object.id()), EScheme.DEATH);

  return object.relation(actor) === EGameObjectRelation.ENEMY || state?.killerId === ACTOR_ID;
});
