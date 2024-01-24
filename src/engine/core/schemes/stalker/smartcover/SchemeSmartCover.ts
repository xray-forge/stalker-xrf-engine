import { world_property } from "xray16";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { ActionSmartCoverUse } from "@/engine/core/schemes/stalker/smartcover/actions";
import { EvaluatorUseSmartCoverInCombat } from "@/engine/core/schemes/stalker/smartcover/evaluators";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover/smartcover_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * Scheme implementing logics of staying in smart cover for stalkers.
 */
export class SchemeSmartCover extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SMARTCOVER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeSmartCoverState {
    const state: ISchemeSmartCoverState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.coverName = readIniString(ini, section, "cover_name", false, null, "$script_id$_cover");
    state.loopholeName = readIniString(ini, section, "loophole_name");
    state.coverState = readIniString(ini, section, "cover_state", false, null, "default_behaviour");
    state.targetEnemy = readIniString(ini, section, "target_enemy");
    state.targetPath = readIniString(ini, section, "target_path", false, null, NIL);
    state.idleMinTime = readIniNumber(ini, section, "idle_min_time", false, 6);
    state.idleMaxTime = readIniNumber(ini, section, "idle_max_time", false, 10);
    state.lookoutMinTime = readIniNumber(ini, section, "lookout_min_time", false, 6);
    state.lookoutMaxTime = readIniNumber(ini, section, "lookout_max_time", false, 10);
    state.exitBodyState = readIniString(ini, section, "exit_body_state", false, null, "stand");
    state.usePrecalcCover = readIniBoolean(ini, section, "use_precalc_cover", false, false);
    state.useInCombat = readIniBoolean(ini, section, "use_in_combat", false, false);
    state.weaponType = readIniString(ini, section, "weapon_type", false);
    state.moving = readIniString(ini, section, "def_state_moving", false, null, "sneak");
    state.soundIdle = readIniString(ini, section, "sound_idle");

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeSmartCoverState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    // Add new evaluators to check smart cover state.
    planner.add_evaluator(
      EEvaluatorId.IS_SMART_COVER_NEEDED,
      new EvaluatorSectionActive(state, "EvaluatorSmartCoverSectionActive")
    );
    planner.add_evaluator(EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT, new EvaluatorUseSmartCoverInCombat(state));

    // Action to handle hiding in smart cover.
    const actionSmartCoverActivity: ActionSmartCoverUse = new ActionSmartCoverUse(state);

    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.IS_SMART_COVER_NEEDED, true));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT, false));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.ENEMY, false));

    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionSmartCoverActivity.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));

    actionSmartCoverActivity.add_effect(new world_property(EEvaluatorId.IS_SMART_COVER_NEEDED, false));
    actionSmartCoverActivity.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    // --new_action.add_effect (new world_property(EEvaluatorId.DANGER, false))
    planner.add_action(EActionId.SMART_COVER_USE, actionSmartCoverActivity);

    // Cannot continue alife when smart cover is needed.
    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_SMART_COVER_NEEDED, false));
    // Cannot participate in combat directly if is active smart cover scheme.
    planner
      .action(EActionId.COMBAT)
      .add_precondition(new world_property(EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT, false));

    // Subscribe to scheme events.
    AbstractScheme.subscribe(state, actionSmartCoverActivity);
  }
}
