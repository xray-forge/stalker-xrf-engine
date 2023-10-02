import { world_property } from "xray16";

import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { ActionCamperPatrol } from "@/engine/core/schemes/stalker/camper/actions";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";
import { EvaluatorCloseCombat, EvaluatorSectionEnded } from "@/engine/core/schemes/stalker/camper/evaluators";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { RADIAN } from "@/engine/lib/constants/math";
import { FALSE } from "@/engine/lib/constants/words";
import {
  ActionBase,
  ActionPlanner,
  ClientObject,
  EScheme,
  ESchemeType,
  IniFile,
  Optional,
  TName,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCamper extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.CAMPER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: ClientObject,
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
        "You are trying to set 'path_look' equal to 'path_walk' in section [%s] for object [%s]",
        section,
        object.name()
      );
    }

    state.sniper = readIniBoolean(ini, section, "sniper", false);
    state.noRetreat = readIniBoolean(ini, section, "no_retreat", false);
    state.shoot = readIniString(ini, section, "shoot", false, null, "always");
    state.sniperAnim = readIniString(ini, section, "sniper_anim", false, null, "hide_na");

    if (state.sniper === true && state.noRetreat === true) {
      abort("ERROR: NPC [%s] Section [%s]. No_retreat not available for SNIPER.", object.name(), section);
    }

    state.radius = readIniNumber(ini, section, "radius", false, 20);

    const campering: Optional<EStalkerState> = readIniString(
      ini,
      section,
      "def_state_campering",
      false
    ) as EStalkerState;

    state.suggestedState = {
      moving: readIniString(ini, section, "def_state_moving", false),
      moving_fire: readIniString(ini, section, "def_state_moving_fire", false),
      campering: campering,
      standing: readIniString(ini, section, "def_state_standing", false, null, campering),
      campering_fire: readIniString(ini, section, "def_state_campering_fire", false) as EStalkerState,
    };

    state.scantimeFree = readIniNumber(ini, section, "scantime_free", false, 60_000);
    state.attackSound = readIniString(ini, section, "attack_sound", false, null, "fight_attack");

    if (state.attackSound === FALSE) {
      state.attackSound = null;
    }

    state.idle = readIniNumber(ini, section, "enemy_idle", false, 60_000);
    state.postEnemyWait = 5_000;
    state.enemyDisp = 7 / RADIAN;

    state.scandelta = 30;
    state.timedelta = 4000;
    state.timeScanDelta = state.timedelta / state.scandelta;

    return state;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCamperState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(
      EEvaluatorId.IS_CAMPING_ENDED,
      new EvaluatorSectionEnded(state, "EvaluatorCamperSectionEnded")
    );
    planner.add_evaluator(EEvaluatorId.IS_CLOSE_COMBAT, new EvaluatorCloseCombat(state));

    const actionPatrol: ActionCamperPatrol = new ActionCamperPatrol(state, object);

    actionPatrol.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));

    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));

    actionPatrol.add_effect(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
    actionPatrol.add_effect(new world_property(EEvaluatorId.ENEMY, false));
    actionPatrol.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.CAMP_PATROL, actionPatrol);
    SchemeCamper.subscribe(object, state, actionPatrol);

    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
    planner.action(EActionId.GATHER_ITEMS).add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
    planner.action(EActionId.SEARCH_CORPSE).add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
    planner.action(EActionId.HELP_WOUNDED).add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));

    const combatPlanner: ActionBase = planner.action(EActionId.COMBAT);

    combatPlanner.add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, true));
    combatPlanner.add_effect(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, false));
    combatPlanner.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    combatPlanner.add_effect(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
  }
}
