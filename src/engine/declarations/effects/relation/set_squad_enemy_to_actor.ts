import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getServerObjectByStoryId } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { ERelation, setSquadRelationToActor } from "@/engine/core/utils/relation";

/**
 * Set squad relation to actor as enemy by story ID.
 */
extern("xr_effects.set_squad_enemy_to_actor", (_: GameObject, __: GameObject, [squadStoryId]: [TStringId]): void => {
  const squad: Nillable<Squad> = getServerObjectByStoryId(squadStoryId);

  if (squad) {
    setSquadRelationToActor(squad, ERelation.ENEMY);
  }
});
