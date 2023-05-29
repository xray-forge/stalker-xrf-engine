import { level, LuabindClass, property_evaluator } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IReleaseDescriptor, ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection";
import { isObjectWounded } from "@/engine/core/utils/check/check";
import { isLootableItem } from "@/engine/core/utils/check/is";
import { communities } from "@/engine/lib/constants/communities";
import { ClientObject, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

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
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (!this.object.alive()) {
      return false;
    } else if (this.object.best_enemy() !== null) {
      return false;
    } else if (this.object.character_community() === communities.zombied) {
      return false;
    } else if (this.state.corpse_detection_enabled === false) {
      return false;
    } else if (isObjectWounded(this.object)) {
      return false;
    } else if (this.object.section() === "actor_visual_stalker") {
      return false;
    }

    const corpses: LuaTable<number, IReleaseDescriptor> = ReleaseBodyManager.getInstance().releaseObjectRegistry;

    let nearestCorpseDistSqr: TDistance = 400;
    let nearestCorpseVertex: Optional<TNumberId> = null;
    let nearestCorpsePosition: Optional<Vector> = null;
    let corpseId: Optional<TNumberId> = null;

    let hasValuableLoot: boolean = false;
    const checkLoot = (npc: ClientObject, item: ClientObject) => {
      if (isLootableItem(item)) {
        hasValuableLoot = true;
      }
    };

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
          hasValuableLoot = false;
          corpseObject.iterate_inventory(checkLoot, corpseObject);

          if (hasValuableLoot) {
            const corpseVertex: number = level.vertex_id(corpseObject.position());

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
