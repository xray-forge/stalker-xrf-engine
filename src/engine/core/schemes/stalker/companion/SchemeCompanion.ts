import { world_property } from "xray16";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { ActionCompanionActivity } from "@/engine/core/schemes/stalker/companion/actions";
import { ISchemeCompanionState } from "@/engine/core/schemes/stalker/companion/companion_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCompanion extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMPANION;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeCompanionState {
    const state: ISchemeCompanionState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.behavior = 0; // beh_walk_simple

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCompanionState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(
      EEvaluatorId.NEED_COMPANION,
      new EvaluatorSectionActive(state, "EvaluatorCompanionSectionActive")
    );

    const actionCompanionActivity: ActionCompanionActivity = new ActionCompanionActivity(state);

    actionCompanionActivity.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionCompanionActivity.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionCompanionActivity.add_precondition(new world_property(EEvaluatorId.NEED_COMPANION, true));
    addCommonActionPreconditions(actionCompanionActivity);
    actionCompanionActivity.add_effect(new world_property(EEvaluatorId.NEED_COMPANION, false));
    actionCompanionActivity.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.COMPANION_ACTIVITY, actionCompanionActivity);

    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_COMPANION, false));
  }
}
