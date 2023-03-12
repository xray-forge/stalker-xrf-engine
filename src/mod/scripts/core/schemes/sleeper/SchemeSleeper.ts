import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { ActionSleeperActivity } from "@/mod/scripts/core/schemes/sleeper/actions/ActionSleeperActivity";
import { EvaluatorNeedSleep } from "@/mod/scripts/core/schemes/sleeper/evaluators/EvaluatorNeedSleep";
import { ISchemeSleeperState } from "@/mod/scripts/core/schemes/sleeper/ISchemeSleeperState";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { getConfigBoolean, getConfigString, getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
export class SchemeSleeper extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SLEEPER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeSleeperState
  ): void {
    const operators = {
      action_sleeper: action_ids.zmey_sleeper_base + 1,
    };

    const properties = {
      need_sleeper: evaluators_id.zmey_sleeper_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(properties.need_sleeper, new EvaluatorNeedSleep(state));

    const actionSleeper: ActionSleeperActivity = new ActionSleeperActivity(state, object);

    actionSleeper.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionSleeper.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionSleeper.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionSleeper.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionSleeper.add_precondition(new world_property(properties.need_sleeper, true));

    addCommonPrecondition(actionSleeper);

    actionSleeper.add_effect(new world_property(properties.need_sleeper, false));
    actionSleeper.add_effect(new world_property(properties.state_mgr_logic_active, false));

    actionPlanner.add_action(operators.action_sleeper, actionSleeper);

    subscribeActionForEvents(object, state, actionSleeper);

    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.need_sleeper, false));
  }

  /**
   * todo;
   */
  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeSleeperState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.path_main = getConfigString(ini, section, "path_main", object, true, additional);
    state.wakeable = getConfigBoolean(ini, section, "wakeable", object, false);
    state.path_walk = null;
    state.path_walk_info = null;
    state.path_look = null;
    state.path_look_info = null;
  }
}
