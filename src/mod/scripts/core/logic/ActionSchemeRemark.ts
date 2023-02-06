import { stalker_ids, world_property, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { IStoredObject } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionRemarkActivity } from "@/mod/scripts/core/logic/actions/ActionRemarkActivity";
import { EvaluatorNeedRemark } from "@/mod/scripts/core/logic/evaluators/EvaluatorNeedRemark";
import { getConfigBoolean, getConfigString, parseCondList } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSchemeRemark");

export class ActionSchemeRemark extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "remark";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    const operators = {
      action_remark: action_ids.zmey_remark_base + 1,
    };
    const properties = {
      event: evaluators_id.reaction,
      need_remark: evaluators_id.zmey_remark_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(
      properties.need_remark,
      create_xr_class_instance(EvaluatorNeedRemark, EvaluatorNeedRemark.__name, state)
    );

    const new_action = create_xr_class_instance(ActionRemarkActivity, ActionRemarkActivity.__name, state);

    new_action.add_precondition(new world_property(stalker_ids.property_alive, true));
    new_action.add_precondition(new world_property(stalker_ids.property_danger, false));
    new_action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    new_action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    new_action.add_precondition(new world_property(properties.need_remark, true));
    get_global<AnyCallablesModule>("xr_motivator").addCommonPrecondition(new_action);
    new_action.add_effect(new world_property(properties.need_remark, false));
    new_action.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.action_remark, new_action);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, state, new_action);
    manager.action(action_ids.alife).add_precondition(new world_property(properties.need_remark, false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    additional: string
  ): void {
    const state = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);
    state.snd_anim_sync = getConfigBoolean(ini, section, "snd_anim_sync", object, false);
    state.snd = getConfigString(ini, section, "snd", object, false, "", null);
    state.anim = parseCondList(
      object,
      "anim",
      "anim",
      getConfigString(ini, section, "anim", object, false, "", "wait")
    );
    state.tips_id = getConfigString(ini, section, "tips", object, false, "");

    if (state.tips_id) {
      state.sender = getConfigString(ini, section, "tips_sender", object, false, "");
    }

    state.target = getConfigString(ini, section, "target", object, false, "", "nil");
    state.target_id = null;
    state.target_position = null;
  }
}
