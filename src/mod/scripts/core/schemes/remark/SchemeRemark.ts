import { stalker_ids, world_property, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { ActionRemarkActivity } from "@/mod/scripts/core/schemes/remark/actions/ActionRemarkActivity";
import { EvaluatorNeedRemark } from "@/mod/scripts/core/schemes/remark/evaluators/EvaluatorNeedRemark";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigString,
  parseCondList,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("SchemeRemark");

/**
 * todo;
 */
export class SchemeRemark extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.REMARK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      action_remark: action_ids.zmey_remark_base + 1,
    };
    const properties = {
      event: evaluators_id.reaction,
      need_remark: evaluators_id.zmey_remark_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(properties.need_remark, new EvaluatorNeedRemark(state));

    const actionRemarkActivity: ActionRemarkActivity = new ActionRemarkActivity(state);

    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionRemarkActivity.add_precondition(new world_property(properties.need_remark, true));
    addCommonPrecondition(actionRemarkActivity);
    actionRemarkActivity.add_effect(new world_property(properties.need_remark, false));
    actionRemarkActivity.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.action_remark, actionRemarkActivity);

    subscribeActionForEvents(object, state, actionRemarkActivity);
    manager.action(action_ids.alife).add_precondition(new world_property(properties.need_remark, false));
  }

  public static override set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
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
