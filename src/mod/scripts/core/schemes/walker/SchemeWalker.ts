import {
  level,
  stalker_ids,
  world_property,
  XR_action_base,
  XR_action_planner,
  XR_game_object,
  XR_ini_file,
} from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject } from "@/mod/scripts/core/db";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { ActionWalkerActivity } from "@/mod/scripts/core/schemes/walker/actions/ActionWalkerActivity";
import { EvaluatorNeedWalker } from "@/mod/scripts/core/schemes/walker/evaluators/EvaluatorNeedWalker";
import { cfg_get_switch_conditions, getConfigBoolean, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("SchemeWalker");

/**
 * todo;
 */
export class SchemeWalker extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.WALKER;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
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

    actionPlanner.add_evaluator(
      properties.need_walker,
      create_xr_class_instance(EvaluatorNeedWalker, state, EvaluatorNeedWalker.__name)
    );

    const new_action = create_xr_class_instance(ActionWalkerActivity, object, ActionWalkerActivity.__name, state);

    new_action.add_precondition(new world_property(stalker_ids.property_alive, true));
    new_action.add_precondition(new world_property(stalker_ids.property_danger, false));
    new_action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    new_action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    new_action.add_precondition(new world_property(properties.need_walker, true));

    addCommonPrecondition(new_action);

    new_action.add_effect(new world_property(properties.need_walker, false));
    new_action.add_effect(new world_property(properties.state_mgr_logic_active, false));

    actionPlanner.add_action(operators.action_walker, new_action);

    subscribeActionForEvents(object, state, new_action);

    const alifeAction: XR_action_base = actionPlanner.action(action_ids.alife);

    alifeAction.add_precondition(new world_property(properties.need_walker, false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
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

    state.suggested_state = {};
    state.suggested_state.standing = getConfigString(ini, section, "def_state_standing", object, false, "");

    state.suggested_state.moving = getConfigString(ini, section, "def_state_moving1", object, false, "");
    state.suggested_state.moving = getConfigString(
      ini,
      section,
      "def_state_moving",
      object,
      false,
      "",
      state.suggested_state.moving
    );

    state.path_walk_info = null;
    state.path_look_info = null;
  }
}
