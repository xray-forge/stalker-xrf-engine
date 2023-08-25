import { stalker_ids, world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { AbstractScheme } from "@/engine/core/schemes";
import { ActionRemarkActivity } from "@/engine/core/schemes/remark/actions/ActionRemarkActivity";
import { EvaluatorNeedRemark } from "@/engine/core/schemes/remark/evaluators/EvaluatorNeedRemark";
import { ISchemeRemarkState } from "@/engine/core/schemes/remark/ISchemeRemarkState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeRemark extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.REMARK;
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
    const state: ISchemeRemarkState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.snd_anim_sync = readIniBoolean(ini, section, "snd_anim_sync", false);
    state.snd = readIniString(ini, section, "snd", false, "", null);
    state.anim = parseConditionsList(readIniString(ini, section, "anim", false, "", "wait"));
    state.tips_id = readIniString(ini, section, "tips", false, "");

    if (state.tips_id !== null) {
      state.sender = readIniString(ini, section, "tips_sender", false, "");
    }

    state.target = readIniString(ini, section, "target", false, "", NIL);
    state.target_id = null;
    state.target_position = null;
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeRemarkState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.NEED_REMARK, new EvaluatorNeedRemark(state));

    const actionRemarkActivity: ActionRemarkActivity = new ActionRemarkActivity(state);

    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionRemarkActivity.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionRemarkActivity.add_precondition(new world_property(EEvaluatorId.NEED_REMARK, true));
    addCommonActionPreconditions(actionRemarkActivity);
    actionRemarkActivity.add_effect(new world_property(EEvaluatorId.NEED_REMARK, false));
    actionRemarkActivity.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    actionPlanner.add_action(EActionId.REMARK_ACTIVITY, actionRemarkActivity);

    SchemeRemark.subscribe(object, state, actionRemarkActivity);
    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_REMARK, false));
  }
}
