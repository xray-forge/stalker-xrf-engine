import { level, LuabindClass, property_evaluator, XR_game_object, XR_vector } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IReleaseDescriptor, ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection";
import { isObjectWounded } from "@/engine/core/utils/check/check";
import { isLootableItem } from "@/engine/core/utils/check/is";
import { communities } from "@/engine/lib/constants/communities";
import { Optional, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCorpseDetect extends property_evaluator {
  public readonly state: ISchemeCorpseDetectionState;

  /**
   * todo: Description.
   */
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

    let nearest_corpse_dist_sqr: number = 400;
    let nearest_corpse_vertex: Optional<number> = null;
    let nearest_corpse_position: Optional<XR_vector> = null;
    let corpse_id: Optional<number> = null;

    let hasValuableLoot: boolean = false;
    const checkLoot = (npc: XR_game_object, item: XR_game_object) => {
      if (isLootableItem(item)) {
        hasValuableLoot = true;
      }
    };

    for (const it of $range(1, corpses.length())) {
      const id: TNumberId = corpses.get(it).id;
      const registryState: Optional<IRegistryObjectState> = registry.objects.get(id);
      const corpseObject: Optional<XR_game_object> = registryState !== null ? registryState.object! : null;

      if (
        corpseObject &&
        this.object.see(corpseObject) &&
        (registryState.corpse_already_selected === null || registryState.corpse_already_selected === this.object.id())
      ) {
        if (this.object.position().distance_to_sqr(corpseObject.position()) < nearest_corpse_dist_sqr) {
          hasValuableLoot = false;
          corpseObject.iterate_inventory(checkLoot, corpseObject);

          if (hasValuableLoot) {
            const corpse_vertex: number = level.vertex_id(corpseObject.position());

            if (this.object.accessible(corpse_vertex)) {
              nearest_corpse_dist_sqr = this.object.position().distance_to_sqr(corpseObject.position());
              nearest_corpse_vertex = corpse_vertex;
              nearest_corpse_position = corpseObject.position();
              corpse_id = id;
            }
          }
        }
      }
    }

    if (nearest_corpse_vertex !== null) {
      this.state.vertex_id = nearest_corpse_vertex;
      this.state.vertex_position = nearest_corpse_position;

      if (this.state.selected_corpse_id !== null && this.state.selected_corpse_id !== corpse_id) {
        if (registry.objects.get(this.state.selected_corpse_id) !== null) {
          registry.objects.get(this.state.selected_corpse_id).corpse_already_selected = null;
        }
      }

      this.state.selected_corpse_id = corpse_id;
      registry.objects.get(this.state.selected_corpse_id!).corpse_already_selected = this.object.id();

      return true;
    }

    return false;
  }
}
