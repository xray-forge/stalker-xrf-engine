import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { ERelation, setSquadRelationWithObject } from "@/engine/core/utils/relation";

/**
 * Set squad relation to an object.
 */
extern(
  "xr_effects.set_squad_goodwill_to_npc",
  (_: GameObject, object: GameObject, [storyId, relation]: [Nillable<TStringId>, Nillable<ERelation>]): void => {
    if (storyId && relation) {
      setSquadRelationWithObject(storyId, object, relation);
    }
  }
);
