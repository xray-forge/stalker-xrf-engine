import { stalker_ids, world_property } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { EActionId, EEvaluatorId } from "@/engine/core/schemes/base/id";
import { ActionSmartCoverActivity } from "@/engine/core/schemes/smartcover/actions";
import { EvaluatorNeedSmartCover, EvaluatorUseSmartCoverInCombat } from "@/engine/core/schemes/smartcover/evaluators";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/smartcover/ISchemeSmartCoverState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeSmartCover extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SMARTCOVER;
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
    const state: ISchemeSmartCoverState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.cover_name = readIniString(ini, section, "cover_name", false, "", "$script_id$_cover");
    state.loophole_name = readIniString(ini, section, "loophole_name", false, "", null);
    state.cover_state = readIniString(ini, section, "cover_state", false, "", "default_behaviour");
    state.target_enemy = readIniString(ini, section, "target_enemy", false, "", null);
    state.target_path = readIniString(ini, section, "target_path", false, "", NIL);
    state.idle_min_time = readIniNumber(ini, section, "idle_min_time", false, 6);
    state.idle_max_time = readIniNumber(ini, section, "idle_max_time", false, 10);
    state.lookout_min_time = readIniNumber(ini, section, "lookout_min_time", false, 6);
    state.lookout_max_time = readIniNumber(ini, section, "lookout_max_time", false, 10);
    state.exit_body_state = readIniString(ini, section, "exit_body_state", false, "", "stand");
    state.use_precalc_cover = readIniBoolean(ini, section, "use_precalc_cover", false, false);
    state.use_in_combat = readIniBoolean(ini, section, "use_in_combat", false, false);
    state.weapon_type = readIniString(ini, section, "weapon_type", false);
    state.moving = readIniString(ini, section, "def_state_moving", false, "", "sneak");
    state.sound_idle = readIniString(ini, section, "sound_idle", false);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeSmartCoverState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.IS_SMART_COVER_NEEDED, new EvaluatorNeedSmartCover(state));
    actionPlanner.add_evaluator(EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT, new EvaluatorUseSmartCoverInCombat(state));

    const actionSmartCoverActivity: ActionSmartCoverActivity = new ActionSmartCoverActivity(state);

    actionSmartCoverActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionSmartCoverActivity.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.IS_SMART_COVER_NEEDED, true));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT, false));
    actionSmartCoverActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));

    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));

    actionSmartCoverActivity.add_effect(new world_property(EEvaluatorId.IS_SMART_COVER_NEEDED, false));
    actionSmartCoverActivity.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    // --new_action.add_effect (new world_property(stalker_ids.property_danger,false))
    actionPlanner.add_action(EActionId.SMART_COVER_ACTIVITY, actionSmartCoverActivity);

    SchemeSmartCover.subscribe(object, state, actionSmartCoverActivity);

    actionPlanner
      .action(EActionId.ALIFE)
      .add_precondition(new world_property(EEvaluatorId.IS_SMART_COVER_NEEDED, false));
    actionPlanner
      .action(stalker_ids.action_combat_planner)
      .add_precondition(new world_property(EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT, false));
  }
}
