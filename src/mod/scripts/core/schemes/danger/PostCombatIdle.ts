import { cast_planner, stalker_ids, world_property, XR_action_base, XR_action_planner, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { ActionPostCombatIdleWait } from "@/mod/scripts/core/schemes/danger/actions";
import { EvaluatorPostCombatIdleEnemy } from "@/mod/scripts/core/schemes/danger/evaluators";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("PostCombatIdle");

export interface IPostCombatSharedState {
  timer: Optional<number>;
  animation: Optional<any>; // From script lua class.
  last_best_enemy_id: Optional<number>;
  last_best_enemy_name: Optional<string>;
}

/**
 * todo;
 */
export class PostCombatIdle {
  public static add_post_combat_idle(npc: XR_game_object): void {
    logger.info("Add post-combat idle for:", npc.name());

    const manager: XR_action_planner = npc.motivation_action_manager();
    const combat_action: XR_action_base = manager.action(stalker_ids.action_combat_planner);
    const combat_action_planner: XR_action_planner = cast_planner(combat_action);

    const state: IPostCombatSharedState = {
      timer: null,
      animation: null,
      last_best_enemy_id: null,
      last_best_enemy_name: null,
    };

    registry.objects.get(npc.id()).post_combat_wait = state;

    manager.remove_evaluator(stalker_ids.property_enemy);
    manager.add_evaluator(stalker_ids.property_enemy, new EvaluatorPostCombatIdleEnemy(state));

    combat_action_planner.remove_evaluator(stalker_ids.property_enemy);
    combat_action_planner.add_evaluator(stalker_ids.property_enemy, new EvaluatorPostCombatIdleEnemy(state));

    combat_action_planner.remove_action(stalker_ids.action_post_combat_wait);

    const new_action: ActionPostCombatIdleWait = new ActionPostCombatIdleWait(state);

    new_action.add_precondition(new world_property(stalker_ids.property_enemy, true));
    new_action.add_precondition(new world_property(stalker_ids.property_pure_enemy, false));
    new_action.add_precondition(new world_property(stalker_ids.property_critically_wounded, false));
    new_action.add_precondition(new world_property(stalker_ids.property_danger_grenade, false));
    new_action.add_effect(new world_property(stalker_ids.property_enemy, false));
    combat_action_planner.add_action(stalker_ids.action_post_combat_wait, new_action);
  }
}
