import { level, stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base/AbstractScheme";
import { action_ids } from "@/engine/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/engine/scripts/core/schemes/base/evaluators_id";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { ActionWalkerActivity } from "@/engine/scripts/core/schemes/walker/actions";
import { EvaluatorNeedWalker } from "@/engine/scripts/core/schemes/walker/evaluators";
import { ISchemeWalkerState } from "@/engine/scripts/core/schemes/walker/ISchemeWalkerState";
import { getConfigBoolean, getConfigString, getConfigSwitchConditions } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { addCommonPrecondition } from "@/engine/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeWalker extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.WALKER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeWalkerState
  ): void {
    const operators = {
      action_walker: action_ids.zmey_walker_base + 1,
    };

    const properties = {
      event: evaluators_id.reaction,
      need_walker: evaluators_id.zmey_walker_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(properties.need_walker, new EvaluatorNeedWalker(state));

    const actionWalkerActivity: ActionWalkerActivity = new ActionWalkerActivity(state, object);

    actionWalkerActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionWalkerActivity.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionWalkerActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionWalkerActivity.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionWalkerActivity.add_precondition(new world_property(properties.need_walker, true));

    addCommonPrecondition(actionWalkerActivity);

    actionWalkerActivity.add_effect(new world_property(properties.need_walker, false));
    actionWalkerActivity.add_effect(new world_property(properties.state_mgr_logic_active, false));

    actionPlanner.add_action(operators.action_walker, actionWalkerActivity);

    subscribeActionForEvents(object, state, actionWalkerActivity);

    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.need_walker, false));
  }

  /**
   * todo;
   */
  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const state: ISchemeWalkerState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.path_walk = getConfigString(ini, section, "path_walk", object, true, gulag_name);

    if (!level.patrol_path_exists(state.path_walk)) {
      abort("there is no patrol path %s", state.path_walk);
    }

    state.path_look = getConfigString(ini, section, "path_look", object, false, gulag_name);

    if (state.path_walk === state.path_look) {
      abort(
        "You are trying to set 'path_look' equal to 'path_walk' in section [%s] for npc [%s]",
        section,
        object.name()
      );
    }

    state.team = getConfigString(ini, section, "team", object, false, gulag_name);
    state.sound_idle = getConfigString(ini, section, "sound_idle", object, false, "");
    state.use_camp = getConfigBoolean(ini, section, "use_camp", object, false, false);

    const baseMoving = getConfigString(ini, section, "def_state_moving1", object, false, "");

    state.suggested_state = {
      standing: getConfigString(ini, section, "def_state_standing", object, false, ""),
      moving: getConfigString(ini, section, "def_state_moving", object, false, "", baseMoving),
    };

    state.path_walk_info = null;
    state.path_look_info = null;
  }
}
