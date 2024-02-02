import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ActionLookAround, ActionShoot } from "@/engine/core/schemes/stalker/combat_camper/actions";
import {
  EvaluatorCombatCamper,
  EvaluatorSeeBestEnemyEnemy,
} from "@/engine/core/schemes/stalker/combat_camper/evaluator";
import { assert } from "@/engine/core/utils/assertion";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * Scheme describing combat of camper type.
 * Used to silently walk near enemy and start shooting only when short distance is reached.
 */
export class SchemeCombatCamper extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_CAMPER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState,
    planner?: ActionPlanner
  ): void {
    assert(planner, "Expected planner to be provided for add method call.");

    planner.add_evaluator(EEvaluatorId.IS_COMBAT_CAMPING_ENABLED, new EvaluatorCombatCamper(state));
    planner.add_evaluator(EEvaluatorId.SEE_BEST_ENEMY, new EvaluatorSeeBestEnemyEnemy(state));

    const shootAction: ActionShoot = new ActionShoot(state);

    shootAction.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    shootAction.add_precondition(new world_property(EEvaluatorId.ENEMY, true));
    shootAction.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    shootAction.add_precondition(new world_property(EEvaluatorId.IS_SCRIPTED_COMBAT, true));
    shootAction.add_precondition(new world_property(EEvaluatorId.IS_COMBAT_CAMPING_ENABLED, true));
    shootAction.add_precondition(new world_property(EEvaluatorId.SEE_BEST_ENEMY, true));
    shootAction.add_effect(new world_property(EEvaluatorId.ENEMY, false));
    shootAction.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.SHOOT, shootAction);

    const lookAroundAction: ActionLookAround = new ActionLookAround(state);

    lookAroundAction.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    lookAroundAction.add_precondition(new world_property(EEvaluatorId.IS_SCRIPTED_COMBAT, true));
    lookAroundAction.add_precondition(new world_property(EEvaluatorId.IS_COMBAT_CAMPING_ENABLED, true));
    lookAroundAction.add_precondition(new world_property(EEvaluatorId.SEE_BEST_ENEMY, false));
    lookAroundAction.add_effect(new world_property(EEvaluatorId.SEE_BEST_ENEMY, true));
    lookAroundAction.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.LOOK_AROUND, lookAroundAction);

    AbstractScheme.subscribe(state, lookAroundAction);

    state.isCamperCombatAction = false;
  }
}
