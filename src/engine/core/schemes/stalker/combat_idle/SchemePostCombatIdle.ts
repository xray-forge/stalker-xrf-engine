import { cast_planner, world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ActionPostCombatIdleWait } from "@/engine/core/schemes/stalker/combat_idle/actions";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/stalker/combat_idle/combat_idle_types";
import { EvaluatorHasEnemy } from "@/engine/core/schemes/stalker/combat_idle/evaluators";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { communities } from "@/engine/lib/constants/communities";
import { ActionPlanner, EScheme, ESchemeType, GameObject } from "@/engine/lib/types";

/**
 * Post combat idle scheme manager.
 * Used to add idle state logics for game objects if it is needed.
 */
export class SchemePostCombatIdle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.POST_COMBAT_IDLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   * todo: Generic idle
   */
  public static setup(object: GameObject): void {
    // Zombied stalkers do not wait for more enemies after ending of combat.
    if (getObjectCommunity(object) === communities.zombied) {
      return;
    }

    const planner: ActionPlanner = object.motivation_action_manager();
    const combatPlanner: ActionPlanner = cast_planner(planner.action(EActionId.COMBAT));

    const state: ISchemePostCombatIdleState = {
      timer: null,
      animation: null,
      lastBestEnemyId: null,
      lastBestEnemyName: null,
    } as ISchemePostCombatIdleState;

    registry.objects.get(object.id())[EScheme.POST_COMBAT_IDLE] = state;

    planner.remove_evaluator(EEvaluatorId.ENEMY);
    planner.add_evaluator(EEvaluatorId.ENEMY, new EvaluatorHasEnemy(state));

    combatPlanner.remove_evaluator(EEvaluatorId.ENEMY);
    combatPlanner.add_evaluator(EEvaluatorId.ENEMY, new EvaluatorHasEnemy(state));
    combatPlanner.remove_action(EActionId.POST_COMBAT_WAIT);

    const actionPostCombatIdleWait: ActionPostCombatIdleWait = new ActionPostCombatIdleWait(state);

    actionPostCombatIdleWait.add_precondition(new world_property(EEvaluatorId.ENEMY, true));
    actionPostCombatIdleWait.add_precondition(new world_property(EEvaluatorId.PURE_ENEMY, false));
    actionPostCombatIdleWait.add_precondition(new world_property(EEvaluatorId.CRITICALLY_WOUNDED, false));
    actionPostCombatIdleWait.add_precondition(new world_property(EEvaluatorId.DANGER_GRENADE, false));
    actionPostCombatIdleWait.add_effect(new world_property(EEvaluatorId.ENEMY, false));

    combatPlanner.add_action(EActionId.POST_COMBAT_WAIT, actionPostCombatIdleWait);
  }
}
