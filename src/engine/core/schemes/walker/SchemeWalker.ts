import { level, stalker_ids, world_property } from "xray16";

import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ActionWalkerActivity } from "@/engine/core/schemes/walker/actions";
import { EvaluatorNeedWalker } from "@/engine/core/schemes/walker/evaluators";
import { ISchemeWalkerState } from "@/engine/core/schemes/walker/ISchemeWalkerState";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonPrecondition } from "@/engine/core/utils/scheme";
import { ActionPlanner, ClientObject, IniFile, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeWalker extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.WALKER;
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
    const state: ISchemeWalkerState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.path_walk = readIniString(ini, section, "path_walk", true, additional);

    if (!level.patrol_path_exists(state.path_walk)) {
      abort("there is no patrol path %s", state.path_walk);
    }

    state.path_look = readIniString(ini, section, "path_look", false, additional);

    if (state.path_walk === state.path_look) {
      abort(
        "You are trying to set 'path_look' equal to 'path_walk' in section [%s] for npc [%s]",
        section,
        object.name()
      );
    }

    state.team = readIniString(ini, section, "team", false, additional);
    state.sound_idle = readIniString(ini, section, "sound_idle", false, "");
    state.use_camp = readIniBoolean(ini, section, "use_camp", false, false);

    const baseMoving: TName = readIniString(ini, section, "def_state_moving1", false, "");

    state.suggested_state = {
      standing: readIniString(ini, section, "def_state_standing", false, ""),
      moving: readIniString(ini, section, "def_state_moving", false, "", baseMoving),
    };

    state.path_walk_info = null;
    state.path_look_info = null;
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeWalkerState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.NEED_WALKER, new EvaluatorNeedWalker(state));

    const actionWalkerActivity: ActionWalkerActivity = new ActionWalkerActivity(state, object);

    actionWalkerActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionWalkerActivity.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionWalkerActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionWalkerActivity.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionWalkerActivity.add_precondition(new world_property(EEvaluatorId.NEED_WALKER, true));

    addCommonPrecondition(actionWalkerActivity);

    actionWalkerActivity.add_effect(new world_property(EEvaluatorId.NEED_WALKER, false));
    actionWalkerActivity.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    actionPlanner.add_action(EActionId.WALKER_ACTIVITY, actionWalkerActivity);

    SchemeWalker.subscribe(object, state, actionWalkerActivity);

    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_WALKER, false));
  }
}
