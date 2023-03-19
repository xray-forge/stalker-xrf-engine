import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { action_ids } from "@/engine/core/schemes/base/actions_id";
import { evaluators_id } from "@/engine/core/schemes/base/evaluators_id";
import { ActionRemarkActivity } from "@/engine/core/schemes/remark/actions/ActionRemarkActivity";
import { EvaluatorNeedRemark } from "@/engine/core/schemes/remark/evaluators/EvaluatorNeedRemark";
import { ISchemeRemarkState } from "@/engine/core/schemes/remark/ISchemeRemarkState";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini_config/config";
import { getConfigBoolean, getConfigString } from "@/engine/core/utils/ini_config/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { addCommonPrecondition } from "@/engine/core/utils/scheme";
import { STRINGIFIED_NIL } from "@/engine/lib/constants/words";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeRemark extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.REMARK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeRemarkState
  ): void {
    const operators = {
      action_remark: action_ids.zmey_remark_base + 1,
    };
    const properties = {
      event: evaluators_id.reaction,
      need_remark: evaluators_id.zmey_remark_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(properties.need_remark, new EvaluatorNeedRemark(state));

    const actionRemarkActivity: ActionRemarkActivity = new ActionRemarkActivity(state);

    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionRemarkActivity.add_precondition(new world_property(properties.need_remark, true));
    addCommonPrecondition(actionRemarkActivity);
    actionRemarkActivity.add_effect(new world_property(properties.need_remark, false));
    actionRemarkActivity.add_effect(new world_property(properties.state_mgr_logic_active, false));
    actionPlanner.add_action(operators.action_remark, actionRemarkActivity);

    subscribeActionForEvents(object, state, actionRemarkActivity);
    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.need_remark, false));
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
    const state: ISchemeRemarkState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.snd_anim_sync = getConfigBoolean(ini, section, "snd_anim_sync", object, false);
    state.snd = getConfigString(ini, section, "snd", object, false, "", null);
    state.anim = parseConditionsList(getConfigString(ini, section, "anim", object, false, "", "wait"));
    state.tips_id = getConfigString(ini, section, "tips", object, false, "");

    if (state.tips_id !== null) {
      state.sender = getConfigString(ini, section, "tips_sender", object, false, "");
    }

    state.target = getConfigString(ini, section, "target", object, false, "", STRINGIFIED_NIL);
    state.target_id = null;
    state.target_position = null;
  }
}
