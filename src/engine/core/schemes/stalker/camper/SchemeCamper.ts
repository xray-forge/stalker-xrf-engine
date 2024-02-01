import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EStalkerState } from "@/engine/core/animation/types";
import { ActionCloseCombat } from "@/engine/core/schemes/stalker/camper/actions";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";
import { camperConfig } from "@/engine/core/schemes/stalker/camper/CamperConfig";
import { EvaluatorCloseCombat, EvaluatorSectionEnded } from "@/engine/core/schemes/stalker/camper/evaluators";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { FALSE } from "@/engine/lib/constants/words";
import {
  ActionBase,
  ActionPlanner,
  EScheme,
  ESchemeType,
  GameObject,
  IniFile,
  Optional,
  TName,
  TSection,
} from "@/engine/lib/types";

/**
 * Scheme defining how stalker should handle camping enemies and waiting for ambush.
 */
export class SchemeCamper extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.CAMPER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName: TName
  ): ISchemeCamperState {
    const state: ISchemeCamperState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.pathWalk = readIniString(ini, section, "path_walk", true, smartTerrainName);
    state.pathLook = readIniString(ini, section, "path_look", true, smartTerrainName);

    if (state.pathWalk === state.pathLook) {
      abort(
        "You are trying to set 'path_look' equal to 'path_walk' in section '%s' for object '%s'.",
        section,
        object.name()
      );
    }

    state.sniper = readIniBoolean(ini, section, "sniper", false);
    state.noRetreat = readIniBoolean(ini, section, "no_retreat", false);
    state.shoot = readIniString(ini, section, "shoot", false, null, "always");
    state.sniperAnim = readIniString(ini, section, "sniper_anim", false, null, EStalkerState.HIDE_NA);

    if (state.sniper && state.noRetreat) {
      abort("Error: object '%s', section '%s'. No_retreat not available for sniper.", object.name(), section);
    }

    state.radius = readIniNumber(ini, section, "radius", false, camperConfig.DEFAULT_CLOSE_RADIUS);

    const campering: Optional<EStalkerState> = readIniString(
      ini,
      section,
      "def_state_campering",
      false
    ) as EStalkerState;

    state.suggestedState = {
      moving: readIniString(ini, section, "def_state_moving", false),
      movingFire: readIniString(ini, section, "def_state_moving_fire", false),
      campering: campering,
      standing: readIniString(ini, section, "def_state_standing", false, null, campering),
      camperingFire: readIniString(ini, section, "def_state_campering_fire", false) as EStalkerState,
    };

    state.scantimeFree = readIniNumber(ini, section, "scantime_free", false, camperConfig.SCAN_FREE_TIME);
    state.attackSound = readIniString(ini, section, "attack_sound", false, null, camperConfig.DEFAULT_ATTACK_SOUND);

    if (state.attackSound === FALSE) {
      state.attackSound = null;
    }

    state.idle = readIniNumber(ini, section, "enemy_idle", false, camperConfig.DEFAULT_IDLE_TIME);
    state.postEnemyWait = camperConfig.DEFAULT_POST_ENEMY_WAIT_TIME;
    state.enemyDisp = camperConfig.DEFAULT_ENEMY_DISPERSION;
    state.scandelta = camperConfig.DEFAULT_SCAN_DELTA;
    state.timedelta = camperConfig.DEFAULT_TIME_DELTA;
    state.timeScanDelta = state.timedelta / state.scandelta;

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCamperState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(
      EEvaluatorId.IS_CLOSE_COMBAT_ENDED,
      new EvaluatorSectionEnded(state, "EvaluatorCamperSectionEnded")
    );
    planner.add_evaluator(EEvaluatorId.IS_CLOSE_COMBAT, new EvaluatorCloseCombat(state));

    const actionCloseCombat: ActionCloseCombat = new ActionCloseCombat(state, object);

    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT_ENDED, false));
    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, false));
    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));

    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionCloseCombat.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));

    actionCloseCombat.add_effect(new world_property(EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true));
    actionCloseCombat.add_effect(new world_property(EEvaluatorId.ENEMY, false));
    actionCloseCombat.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.CLOSE_COMBAT, actionCloseCombat);

    AbstractScheme.subscribe(state, actionCloseCombat);

    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true));
    planner
      .action(EActionId.GATHER_ITEMS)
      .add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true));
    planner
      .action(EActionId.SEARCH_CORPSE)
      .add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true));
    planner
      .action(EActionId.HELP_WOUNDED)
      .add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true));

    const combatPlanner: ActionBase = planner.action(EActionId.COMBAT);

    combatPlanner.add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, true));
    combatPlanner.add_effect(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, false));
    combatPlanner.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    combatPlanner.add_effect(new world_property(EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true));
  }
}
