import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme, action_ids, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { ActionCompanionActivity } from "@/mod/scripts/core/schemes/companion/actions";
import { EvaluatorNeedCompanion } from "@/mod/scripts/core/schemes/companion/evaluators";
import { ISchemeCompanionState } from "@/mod/scripts/core/schemes/companion/ISchemeCompanionState";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
export class SchemeCompanion extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMPANION;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCompanionState
  ): void {
    const operators = {
      action_companion: action_ids.zmey_companion_base + 1,
    };
    const properties = {
      need_companion: evaluators_id.zmey_companion_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(properties.need_companion, new EvaluatorNeedCompanion(state));

    const actionCompanionActivity: ActionCompanionActivity = new ActionCompanionActivity(state);

    actionCompanionActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionCompanionActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionCompanionActivity.add_precondition(new world_property(properties.need_companion, true));
    addCommonPrecondition(actionCompanionActivity);
    actionCompanionActivity.add_effect(new world_property(properties.need_companion, false));
    actionCompanionActivity.add_effect(new world_property(properties.state_mgr_logic_active, false));
    actionPlanner.add_action(operators.action_companion, actionCompanionActivity);

    subscribeActionForEvents(object, state, actionCompanionActivity);

    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.need_companion, false));
  }

  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeCompanionState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.behavior = 0; // beh_walk_simple
  }
}
