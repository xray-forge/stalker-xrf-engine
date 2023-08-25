import { cast_planner, world_property } from "xray16";

import { registry } from "@/engine/core/database";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai";
import { ActionPostCombatIdleWait } from "@/engine/core/schemes/combat_idle/actions";
import { EvaluatorHasEnemy } from "@/engine/core/schemes/combat_idle/evaluators";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/combat_idle/ISchemePostCombatIdleState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionBase, ActionPlanner, ClientObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Post combat idle scheme manager.
 * Used to add idle state logics for game objects if it is needed.
 */
export class PostCombatIdle {
  /**
   * todo: Description.
   */
  public static addPostCombatIdleWait(object: ClientObject): void {
    // logger.info("Add post-combat idle for:", object.name());

    const actionPlanner: ActionPlanner = object.motivation_action_manager();
    const combatAction: ActionBase = actionPlanner.action(EActionId.COMBAT);
    const combatActionPlanner: ActionPlanner = cast_planner(combatAction);

    const state: ISchemePostCombatIdleState = {
      timer: null,
      animation: null,
      last_best_enemy_id: null,
      last_best_enemy_name: null,
    };

    registry.objects.get(object.id()).post_combat_wait = state;

    actionPlanner.remove_evaluator(EEvaluatorId.ENEMY);
    actionPlanner.add_evaluator(EEvaluatorId.ENEMY, new EvaluatorHasEnemy(state));

    combatActionPlanner.remove_evaluator(EEvaluatorId.ENEMY);
    combatActionPlanner.add_evaluator(EEvaluatorId.ENEMY, new EvaluatorHasEnemy(state));
    combatActionPlanner.remove_action(EActionId.POST_COMBAT_WAIT);

    const actionPostCombatIdleWait: ActionPostCombatIdleWait = new ActionPostCombatIdleWait(state);

    actionPostCombatIdleWait.add_precondition(new world_property(EEvaluatorId.ENEMY, true));
    actionPostCombatIdleWait.add_precondition(new world_property(EEvaluatorId.PURE_ENEMY, false));
    actionPostCombatIdleWait.add_precondition(new world_property(EEvaluatorId.CRITICALLY_WOUNDED, false));
    actionPostCombatIdleWait.add_precondition(new world_property(EEvaluatorId.DANGER_GRENADE, false));
    actionPostCombatIdleWait.add_effect(new world_property(EEvaluatorId.ENEMY, false));

    combatActionPlanner.add_action(EActionId.POST_COMBAT_WAIT, actionPostCombatIdleWait);
  }
}
