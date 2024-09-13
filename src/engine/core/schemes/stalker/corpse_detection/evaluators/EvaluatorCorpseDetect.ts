import { LuabindClass, property_evaluator } from "xray16";

import { setPortableStoreValue } from "@/engine/core/database";
import {
  ISchemeCorpseDetectionState,
  PS_LOOTING_DEAD_OBJECT,
} from "@/engine/core/schemes/stalker/corpse_detection/corpse_detection_types";
import { freeSelectedLootedObjectSpot } from "@/engine/core/schemes/stalker/corpse_detection/utils";
import { getNearestCorpseToLoot } from "@/engine/core/utils/loot";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_VISUAL_STALKER } from "@/engine/lib/constants/sections";
import { TNumberId } from "@/engine/lib/types";

/**
 * Evaluator to check whether object can find some corpse to loot and pick items from it.
 */
@LuabindClass()
export class EvaluatorCorpseDetect extends property_evaluator {
  public readonly state: ISchemeCorpseDetectionState;

  public constructor(state: ISchemeCorpseDetectionState) {
    super(null, EvaluatorCorpseDetect.__name);
    this.state = state;
  }

  /**
   * Check if corpse with valuables is detected.
   */
  public override evaluate(): boolean {
    return (
      // Dead cannot loot.
      this.object.alive() &&
      // Is in combat, cannot loot.
      this.object.best_enemy() === null &&
      // Looting logics should not be disabled
      this.state.isCorpseDetectionEnabled !== false &&
      // Is zombied, does not care.
      this.object.character_community() !== communities.zombied &&
      // If wounded, cannot do anything.
      !isObjectWounded(this.object.id()) &&
      // Is cutscene participant, does not care about loot.
      this.object.section() !== ACTOR_VISUAL_STALKER &&
      // Has anything to loot.
      this.hasCorpseToLoot()
    );
  }

  /**
   * @returns whether any nearby corpse to loot exists
   */
  public hasCorpseToLoot(): boolean {
    const [corpseObject, corpseVertexId, corpsePosition] = getNearestCorpseToLoot(this.object);

    if (corpseVertexId !== null) {
      const corpseId: TNumberId = corpseObject.id();

      // Looted corpse before, mark it as not selected.
      if (this.state.selectedCorpseId !== null && this.state.selectedCorpseId !== corpseId) {
        freeSelectedLootedObjectSpot(this.state.selectedCorpseId);
      }

      setPortableStoreValue(corpseId, PS_LOOTING_DEAD_OBJECT, this.object.id());

      // Link looting state for current object and looted object.
      this.state.selectedCorpseId = corpseId;
      this.state.selectedCorpseVertexId = corpseVertexId;
      this.state.selectedCorpseVertexPosition = corpsePosition;

      return true;
    }

    return false;
  }
}
