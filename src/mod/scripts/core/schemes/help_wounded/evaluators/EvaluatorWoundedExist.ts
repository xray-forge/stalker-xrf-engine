import { level, LuabindClass, property_evaluator } from "xray16";

import { communities } from "@/mod/globals/communities";
import { registry } from "@/mod/scripts/core/database";
import { ISchemeHelpWoundedState } from "@/mod/scripts/core/schemes/help_wounded";
import { isObjectWounded } from "@/mod/scripts/utils/checkers/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorWoundedExist");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorWoundedExist extends property_evaluator {
  public readonly state: ISchemeHelpWoundedState;

  /**
   * todo;
   */
  public constructor(storage: ISchemeHelpWoundedState) {
    super(null, EvaluatorWoundedExist.__name);
    this.state = storage;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    const npc = this.object;

    if (!npc.alive()) {
      return false;
    }

    if (npc.best_enemy() !== null) {
      return false;
    }

    if (npc.character_community() === communities.zombied) {
      return false;
    }

    if (this.state.help_wounded_enabled === false) {
      return false;
    }

    if (isObjectWounded(npc)) {
      return false;
    }

    if (npc.section() === "actor_visual_stalker") {
      return false;
    }

    let nearest_dist = 900; // sqr -> 30*30
    let nearest_vertex = null;
    let nearest_position = null;
    let selected_id = null;

    for (const v of npc.memory_visible_objects()) {
      const vo = v.object();
      const id = vo.id();
      const npc_id = npc.id();

      if (
        npc.see(vo) &&
        isObjectWounded(vo) &&
        (registry.objects.get(id).wounded_already_selected === null ||
          registry.objects.get(id).wounded_already_selected === npc_id) &&
        vo.alive()
      ) {
        if (registry.objects.get(id).wounded!.not_for_help !== true) {
          const npc_position = npc.position();
          const vo_position = vo.position();

          if (npc_position.distance_to_sqr(vo_position) < nearest_dist) {
            const vertex = level.vertex_id(vo_position);

            if (npc.accessible(vertex)) {
              nearest_dist = npc_position.distance_to_sqr(vo_position);
              nearest_vertex = vertex;
              nearest_position = vo_position;
              selected_id = id;
            }
          }
        }
      }
    }

    if (nearest_vertex !== null) {
      this.state.vertex_id = nearest_vertex;
      this.state.vertex_position = nearest_position!;

      if (
        this.state.selected_id !== null &&
        this.state.selected_id !== selected_id &&
        registry.objects.get(this.state.selected_id) !== null
      ) {
        registry.objects.get(this.state.selected_id).wounded_already_selected = null;
      }

      this.state.selected_id = selected_id!;
      registry.objects.get(this.state.selected_id!).wounded_already_selected = npc.id();

      return true;
    }

    return false;
  }
}
