import { cast_planner, stalker_ids, world_property, XR_action_base, XR_action_planner, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { ActionPostCombatIdleWait } from "@/engine/core/schemes/danger/actions";
import { EvaluatorPostCombatIdleEnemy } from "@/engine/core/schemes/danger/evaluators";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/danger/ISchemePostCombatIdleState";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class PostCombatIdle {
  /**
   * todo;
   */
  public static addPostCombatIdleWait(object: XR_game_object): void {
    logger.info("Add post-combat idle for:", object.name());

    const actionPlanner: XR_action_planner = object.motivation_action_manager();
    const combatAction: XR_action_base = actionPlanner.action(stalker_ids.action_combat_planner);
    const combatActionPlanner: XR_action_planner = cast_planner(combatAction);

    const state: ISchemePostCombatIdleState = {
      timer: null,
      animation: null,
      last_best_enemy_id: null,
      last_best_enemy_name: null,
    };

    registry.objects.get(object.id()).post_combat_wait = state;

    actionPlanner.remove_evaluator(stalker_ids.property_enemy);
    actionPlanner.add_evaluator(stalker_ids.property_enemy, new EvaluatorPostCombatIdleEnemy(state));

    combatActionPlanner.remove_evaluator(stalker_ids.property_enemy);
    combatActionPlanner.add_evaluator(stalker_ids.property_enemy, new EvaluatorPostCombatIdleEnemy(state));
    combatActionPlanner.remove_action(stalker_ids.action_post_combat_wait);

    const actionPostCombatIdleWait: ActionPostCombatIdleWait = new ActionPostCombatIdleWait(state);

    actionPostCombatIdleWait.add_precondition(new world_property(stalker_ids.property_enemy, true));
    actionPostCombatIdleWait.add_precondition(new world_property(stalker_ids.property_pure_enemy, false));
    actionPostCombatIdleWait.add_precondition(new world_property(stalker_ids.property_critically_wounded, false));
    actionPostCombatIdleWait.add_precondition(new world_property(stalker_ids.property_danger_grenade, false));
    actionPostCombatIdleWait.add_effect(new world_property(stalker_ids.property_enemy, false));

    combatActionPlanner.add_action(stalker_ids.action_post_combat_wait, actionPostCombatIdleWait);
  }
}
