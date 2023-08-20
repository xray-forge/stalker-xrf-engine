import { level, LuabindClass, property_evaluator } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IReleaseDescriptor, ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection";
import { isObjectWithValuableLoot, isObjectWounded } from "@/engine/core/utils/object";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_VISUAL_STALKER } from "@/engine/lib/constants/sections";
import { ClientObject, LuaArray, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

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
    if (
      // Dead cannot loot.
      !this.object.alive() ||
      // Is in combat, cannot loot.
      this.object.best_enemy() !== null ||
      // Is zombied, does not care.
      this.object.character_community() === communities.zombied ||
      // Looting logics is disabled.
      this.state.isCorpseDetectionEnabled === false ||
      // Is wounded, cannot do anything.
      isObjectWounded(this.object.id()) ||
      // Is cutscene participant, does not care about loot.
      this.object.section() === ACTOR_VISUAL_STALKER
    ) {
      return false;
    }

    const corpses: LuaArray<IReleaseDescriptor> = ReleaseBodyManager.getInstance().releaseObjectRegistry;

    let nearestCorpseDistSqr: TDistance = 400; // 20 * 20
    let nearestCorpseVertex: Optional<TNumberId> = null;
    let nearestCorpsePosition: Optional<Vector> = null;
    let corpseId: Optional<TNumberId> = null;

    for (const it of $range(1, corpses.length())) {
      const id: TNumberId = corpses.get(it).id;
      const registryState: Optional<IRegistryObjectState> = registry.objects.get(id);
      const corpseObject: Optional<ClientObject> = registryState !== null ? registryState.object! : null;

      if (
        // Is registered in client side.
        corpseObject &&
        // Is not looted by anyone or looted by current object.
        (registryState.lootedByObject === null || registryState.lootedByObject === this.object.id()) &&
        // Is visible so can be looted.
        this.object.see(corpseObject)
      ) {
        if (
          // Is near enough.
          this.object.position().distance_to_sqr(corpseObject.position()) < nearestCorpseDistSqr &&
          // Has valuable loot.
          isObjectWithValuableLoot(corpseObject)
        ) {
          const corpseVertex: TNumberId = level.vertex_id(corpseObject.position());

          // Can be reached by object.
          if (this.object.accessible(corpseVertex)) {
            nearestCorpseDistSqr = this.object.position().distance_to_sqr(corpseObject.position());
            nearestCorpseVertex = corpseVertex;
            nearestCorpsePosition = corpseObject.position();
            corpseId = id;
          }
        }
      }
    }

    if (nearestCorpseVertex !== null) {
      this.state.selectedCorpseVertexId = nearestCorpseVertex;
      this.state.selectedCorpseVertexPosition = nearestCorpsePosition;

      // Looted corpse before, mark it as not selected.
      if (this.state.selectedCorpseId !== null && this.state.selectedCorpseId !== corpseId) {
        const lootedObjectState: Optional<IRegistryObjectState> = registry.objects.get(this.state.selectedCorpseId);

        if (lootedObjectState !== null) {
          lootedObjectState.lootedByObject = null;
        }
      }

      // Link looting state for current object and looted object.
      this.state.selectedCorpseId = corpseId;
      registry.objects.get(corpseId as TNumberId).lootedByObject = this.object.id();

      return true;
    }

    return false;
  }
}
