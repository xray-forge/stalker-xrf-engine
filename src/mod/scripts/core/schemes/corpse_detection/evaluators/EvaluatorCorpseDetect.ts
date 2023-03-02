import { level, property_evaluator, XR_game_object, XR_vector } from "xray16";

import { communities } from "@/mod/globals/communities";
import { Optional } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { IReleaseDescriptor, ReleaseBodyManager } from "@/mod/scripts/core/managers/ReleaseBodyManager";
import { isObjectWounded } from "@/mod/scripts/utils/checkers/checkers";
import { isLootableItem } from "@/mod/scripts/utils/checkers/is";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCorpseDetect extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorCorpseDetect.__name);
    this.state = state;
  }

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
      const id = corpses.get(it).id;
      const state: Optional<IStoredObject> = registry.objects.get(id);
      const corpse_npc: Optional<XR_game_object> = state !== null ? state.object! : null;

      if (
        corpse_npc &&
        this.object.see(corpse_npc) &&
        (state.corpse_already_selected === null || state.corpse_already_selected === this.object.id())
      ) {
        if (this.object.position().distance_to_sqr(corpse_npc.position()) < nearest_corpse_dist_sqr) {
          hasValuableLoot = false;
          corpse_npc.iterate_inventory(checkLoot, corpse_npc);

          if (hasValuableLoot) {
            const corpse_vertex: number = level.vertex_id(corpse_npc.position());

            if (this.object.accessible(corpse_vertex)) {
              nearest_corpse_dist_sqr = this.object.position().distance_to_sqr(corpse_npc.position());
              nearest_corpse_vertex = corpse_vertex;
              nearest_corpse_position = corpse_npc.position();
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
      registry.objects.get(this.state.selected_corpse_id).corpse_already_selected = this.object.id();

      return true;
    }

    return false;
  }
}
