import { LuabindClass, property_evaluator } from "xray16";

import { setPortableStoreValue } from "@/engine/core/database";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/stalker/corpse_detection/ISchemeCorpseDetectionState";
import { freeSelectedLootedObjectSpot } from "@/engine/core/schemes/stalker/corpse_detection/utils";
import { LuaLogger } from "@/engine/core/utils/logging";
import { findNearestCorpseToLoot, isObjectWounded } from "@/engine/core/utils/object";
import { communities } from "@/engine/lib/constants/communities";
import { LOOTING_DEAD_OBJECT_KEY } from "@/engine/lib/constants/portable_store_keys";
import { ACTOR_VISUAL_STALKER } from "@/engine/lib/constants/sections";
import { TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
   * todo;
   *
   * @returns whether any corpse nearby exists
   */
  public hasCorpseToLoot(): boolean {
    const [corpseObject, corpseVertexId, corpsePosition] = findNearestCorpseToLoot(this.object);

    if (corpseVertexId !== null) {
      const corpseId: TNumberId = corpseObject.id();

      // Looted corpse before, mark it as not selected.
      if (this.state.selectedCorpseId !== null && this.state.selectedCorpseId !== corpseId) {
        freeSelectedLootedObjectSpot(this.state.selectedCorpseId);
      }

      setPortableStoreValue(corpseId, LOOTING_DEAD_OBJECT_KEY, this.object.id());

      // Link looting state for current object and looted object.
      this.state.selectedCorpseId = corpseId;
      this.state.selectedCorpseVertexId = corpseVertexId;
      this.state.selectedCorpseVertexPosition = corpsePosition;

      return true;
    }

    return false;
  }
}
