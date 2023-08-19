import { level, LuabindClass, property_evaluator } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IReleaseDescriptor, ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection";
import { isObjectWithValuableLoot, isObjectWounded } from "@/engine/core/utils/object";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_VISUAL_STALKER } from "@/engine/lib/constants/sections";
import { ClientObject, LuaArray, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCorpseDetect extends property_evaluator {
  public readonly state: ISchemeCorpseDetectionState;

  public constructor(state: ISchemeCorpseDetectionState) {
    super(null, EvaluatorCorpseDetect.__name);
    this.state = state;
  }

  /**
   * Check if coprse with valuables is detected.
   */
  public override evaluate(): boolean {
    if (
      !this.object.alive() || // Dead cannot loot.
      this.object.best_enemy() !== null || // Is in combat, cannot loot.
      this.object.character_community() === communities.zombied || // Is zombied, does not care.
      this.state.corpse_detection_enabled === false || // Looting logics is disabled.
      isObjectWounded(this.object.id()) || // Is wounded, cannot do anything.
      this.object.section() === ACTOR_VISUAL_STALKER // Is cutscene participant, does not care about loot.
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
        corpseObject &&
        this.object.see(corpseObject) &&
        (registryState.corpse_already_selected === null || registryState.corpse_already_selected === this.object.id())
      ) {
        if (this.object.position().distance_to_sqr(corpseObject.position()) < nearestCorpseDistSqr) {
          if (isObjectWithValuableLoot(corpseObject)) {
            const corpseVertex: TNumberId = level.vertex_id(corpseObject.position());

            if (this.object.accessible(corpseVertex)) {
              nearestCorpseDistSqr = this.object.position().distance_to_sqr(corpseObject.position());
              nearestCorpseVertex = corpseVertex;
              nearestCorpsePosition = corpseObject.position();
              corpseId = id;
            }
          }
        }
      }
    }

    if (nearestCorpseVertex !== null) {
      this.state.vertex_id = nearestCorpseVertex;
      this.state.vertex_position = nearestCorpsePosition;

      if (this.state.selected_corpse_id !== null && this.state.selected_corpse_id !== corpseId) {
        if (registry.objects.get(this.state.selected_corpse_id) !== null) {
          registry.objects.get(this.state.selected_corpse_id).corpse_already_selected = null;
        }
      }

      this.state.selected_corpse_id = corpseId;
      registry.objects.get(this.state.selected_corpse_id!).corpse_already_selected = this.object.id();

      return true;
    }

    return false;
  }
}
