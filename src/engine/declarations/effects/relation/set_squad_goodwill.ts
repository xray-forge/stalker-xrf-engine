import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { ERelation, updateSquadIdRelationToActor } from "@/engine/core/utils/relation";

/**
 * Set squad relation to an actor.
 */
extern(
  "xr_effects.set_squad_goodwill",
  (_: GameObject, __: GameObject, [storyId, relation]: [Nillable<TStringId>, Nillable<ERelation>]): void => {
    if (storyId && relation) {
      updateSquadIdRelationToActor(storyId, relation);
    }
  }
);
