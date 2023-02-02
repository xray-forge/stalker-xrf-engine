import { level, stalker_ids, world_property, XR_action_base, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionWalkerActivity } from "@/mod/scripts/core/logic/actions/ActionWalkerActivity";
import { EvaluatorNeedWalker } from "@/mod/scripts/core/logic/evaluators/EvaluatorNeedWalker";
import { getConfigBoolean, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionWalker");

export class ActionWalker extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "walker";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    const operators = {
      action_walker: get_global("xr_actions_id").zmey_walker_base + 1
    };
    const properties = {
      event: get_global("xr_evaluators_id").reaction,
      need_walker: get_global("xr_evaluators_id").zmey_walker_base + 1,
      state_mgr_logic_active: get_global("xr_evaluators_id").state_mgr + 4
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(
      properties["need_walker"],
      create_xr_class_instance(EvaluatorNeedWalker, state, "walker_need")
    );

    const new_action = create_xr_class_instance(ActionWalkerActivity, object, "action_walker_activity", state);

    new_action.add_precondition(new world_property(stalker_ids.property_alive, true));
    new_action.add_precondition(new world_property(stalker_ids.property_danger, false));
    new_action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    new_action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    new_action.add_precondition(new world_property(properties["need_walker"], true));
    get_global<AnyCallablesModule>("xr_motivator").addCommonPrecondition(new_action);

    new_action.add_effect(new world_property(properties["need_walker"], false));
    new_action.add_effect(new world_property(properties["state_mgr_logic_active"], false));
    manager.add_action(operators["action_walker"], new_action);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, state, new_action);

    const alifeAction: XR_action_base = manager.action(get_global("xr_actions_id").alife);

    alifeAction.add_precondition(new world_property(properties["need_walker"], false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const state = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);

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
