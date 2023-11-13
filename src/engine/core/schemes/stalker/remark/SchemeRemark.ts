import { world_property } from "xray16";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { ActionRemarkActivity } from "@/engine/core/schemes/stalker/remark/actions/ActionRemarkActivity";
import { ISchemeRemarkState } from "@/engine/core/schemes/stalker/remark/remark_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeRemark extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.REMARK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeRemarkState {
    const state: ISchemeRemarkState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.sndAnimSync = readIniBoolean(ini, section, "snd_anim_sync", false);
    state.snd = readIniString(ini, section, "snd", false);
    state.anim = parseConditionsList(readIniString(ini, section, "anim", false, null, "wait"));
    state.tipsId = readIniString(ini, section, "tips", false);

    if (state.tipsId !== null) {
      state.sender = readIniString(ini, section, "tips_sender", false);
    }

    state.target = readIniString(ini, section, "target", false, null, NIL);
    state.targetId = null;
    state.targetPosition = null;

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeRemarkState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(EEvaluatorId.NEED_REMARK, new EvaluatorSectionActive(state, "EvaluatorRemarkSectionActive"));

    const actionRemarkActivity: ActionRemarkActivity = new ActionRemarkActivity(state);

    actionRemarkActivity.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionRemarkActivity.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionRemarkActivity.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionRemarkActivity.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionRemarkActivity.add_precondition(new world_property(EEvaluatorId.NEED_REMARK, true));
    addCommonActionPreconditions(actionRemarkActivity);

    actionRemarkActivity.add_effect(new world_property(EEvaluatorId.NEED_REMARK, false));
    actionRemarkActivity.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.REMARK_ACTIVITY, actionRemarkActivity);

    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_REMARK, false));

    AbstractScheme.subscribe(state, actionRemarkActivity);
  }
}
