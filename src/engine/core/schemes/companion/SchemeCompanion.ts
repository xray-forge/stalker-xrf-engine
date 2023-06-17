import { stalker_ids, world_property } from "xray16";

import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ActionCompanionActivity } from "@/engine/core/schemes/companion/actions";
import { EvaluatorNeedCompanion } from "@/engine/core/schemes/companion/evaluators";
import { ISchemeCompanionState } from "@/engine/core/schemes/companion/ISchemeCompanionState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/setup";
import { ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCompanion extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMPANION;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeCompanionState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.behavior = 0; // beh_walk_simple
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCompanionState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.NEED_COMPANION, new EvaluatorNeedCompanion(state));

    const actionCompanionActivity: ActionCompanionActivity = new ActionCompanionActivity(state);

    actionCompanionActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionCompanionActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionCompanionActivity.add_precondition(new world_property(EEvaluatorId.NEED_COMPANION, true));
    addCommonActionPreconditions(actionCompanionActivity);
    actionCompanionActivity.add_effect(new world_property(EEvaluatorId.NEED_COMPANION, false));
    actionCompanionActivity.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    actionPlanner.add_action(EActionId.COMPANION_ACTIVITY, actionCompanionActivity);

    SchemeCompanion.subscribe(object, state, actionCompanionActivity);

    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_COMPANION, false));
  }
}
