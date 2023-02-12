import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { IStoredObject } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { assign_storage_and_bind, subscribe_action_for_events } from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionBaseCover, IActionBaseCover } from "@/mod/scripts/core/logic/actions/ActionBaseCover";
import { EvaluatorNeedCover } from "@/mod/scripts/core/logic/evaluators/EvaluatorNeedCover";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  parseCondList,
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionCover");

export class ActionCover extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "cover";

  /**
   * Add scheme to object binder for initialization.
   */
  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      action_cover: action_ids.stohe_cover_base + 1,
    };
    const properties = {
      event: evaluators_id.reaction,
      need_cover: evaluators_id.stohe_cover_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const manager: XR_action_planner = object.motivation_action_manager();

    manager.add_evaluator(
      properties.need_cover,
      create_xr_class_instance(EvaluatorNeedCover, state, EvaluatorNeedCover.__name)
    );

    const new_action: IActionBaseCover = create_xr_class_instance(ActionBaseCover, ActionBaseCover.__name, state);

    new_action.add_precondition(new world_property(stalker_ids.property_alive, true));
    new_action.add_precondition(new world_property(stalker_ids.property_danger, false));
    new_action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    new_action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    new_action.add_precondition(new world_property(evaluators_id.sidor_wounded_base, false));
    new_action.add_precondition(new world_property(properties.need_cover, true));
    new_action.add_effect(new world_property(properties.need_cover, false));
    new_action.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.action_cover, new_action);

    subscribe_action_for_events(object, state, new_action);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.need_cover, false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    additional: string
  ): void {
    logger.info("Set scheme:", object.name());

    const state = assign_storage_and_bind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
    state.smart = getConfigString(ini, section, "smart", object, false, "");
    state.anim = parseCondList(
      object,
      "anim",
      "anim",
      getConfigString(ini, section, "anim", object, false, "", "hide")
    );
    state.sound_idle = getConfigString(ini, section, "sound_idle", object, false, "");

    if (state.smart === null) {
      abort("There is no path_walk and smart in ActionCover.");
    }

    state.use_attack_direction = getConfigBoolean(ini, section, "use_attack_direction", object, false, true);

    state.radius_min = getConfigNumber(ini, section, "radius_min", object, false, 3);
    state.radius_max = getConfigNumber(ini, section, "radius_max", object, false, 5);
  }
}
