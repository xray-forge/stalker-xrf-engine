import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { EStalkerState } from "@/engine/core/objects/animation";
import { AbstractScheme } from "@/engine/core/schemes";
import { ActionCamperPatrol } from "@/engine/core/schemes/camper/actions";
import { EvaluatorCloseCombat, EvaluatorEnd } from "@/engine/core/schemes/camper/evaluators";
import { ISchemeCamperState } from "@/engine/core/schemes/camper/ISchemeCamperState";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { RADIAN } from "@/engine/lib/constants/math";
import { FALSE } from "@/engine/lib/constants/words";
import { ActionBase, ClientObject, EScheme, ESchemeType, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCamper extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.CAMPER;
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
    const state: ISchemeCamperState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.path_walk = readIniString(ini, section, "path_walk", true, additional);
    state.path_look = readIniString(ini, section, "path_look", true, additional);

    if (state.path_walk === state.path_look) {
      abort(
        "You are trying to set 'path_look' equal to 'path_walk' in section [%s] for npc [%s]",
        section,
        object.name()
      );
    }

    state.sniper = readIniBoolean(ini, section, "sniper", false);
    state.no_retreat = readIniBoolean(ini, section, "no_retreat", false);
    state.shoot = readIniString(ini, section, "shoot", false, "", "always");
    state.sniper_anim = readIniString(ini, section, "sniper_anim", false, "hide_na");

    if (state.sniper === true && state.no_retreat === true) {
      abort("ERROR: NPC [%s] Section [%s]. No_retreat not available for SNIPER.", object.name(), section);
    }

    state.radius = readIniNumber(ini, section, "radius", false, 20);

    const campering: Optional<EStalkerState> = readIniString(
      ini,
      section,
      "def_state_campering",
      false
    ) as EStalkerState;

    state.suggested_state = {
      moving: readIniString(ini, section, "def_state_moving", false),
      moving_fire: readIniString(ini, section, "def_state_moving_fire", false),
      campering: campering,
      standing: readIniString(ini, section, "def_state_standing", false, "", campering),
      campering_fire: readIniString(ini, section, "def_state_campering_fire", false) as EStalkerState,
    };

    state.scantime_free = readIniNumber(ini, section, "scantime_free", false, 60_000);
    state.attack_sound = readIniString(ini, section, "attack_sound", false, "", "fight_attack");

    if (state.attack_sound === FALSE) {
      state.attack_sound = null;
    }

    state.idle = readIniNumber(ini, section, "enemy_idle", false, 60_000);
    state.post_enemy_wait = 5_000;
    state.enemy_disp = 7 / RADIAN;

    state.scandelta = 30;
    state.timedelta = 4000;
    state.time_scan_delta = state.timedelta / state.scandelta;
  }
  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCamperState
  ): void {
    const manager = object.motivation_action_manager();

    manager.add_evaluator(EEvaluatorId.IS_CAMPING_ENDED, new EvaluatorEnd(state));
    manager.add_evaluator(EEvaluatorId.IS_CLOSE_COMBAT, new EvaluatorCloseCombat(state));

    const actionPatrol: ActionCamperPatrol = new ActionCamperPatrol(state, object);

    actionPatrol.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.ANONALY, false));

    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));

    actionPatrol.add_effect(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
    actionPatrol.add_effect(new world_property(EEvaluatorId.ENEMY, false));
    actionPatrol.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    manager.add_action(EActionId.CAMP_PATROL, actionPatrol);
    SchemeCamper.subscribe(object, state, actionPatrol);

    manager.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
    manager.action(EActionId.GATHER_ITEMS).add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
    manager.action(EActionId.SEARCH_CORPSE).add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
    manager.action(EActionId.HELP_WOUNDED).add_precondition(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));

    const actionCombatPlanner: ActionBase = manager.action(EActionId.COMBAT);

    actionCombatPlanner.add_precondition(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, true));
    actionCombatPlanner.add_effect(new world_property(EEvaluatorId.IS_CLOSE_COMBAT, false));
    actionCombatPlanner.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    actionCombatPlanner.add_effect(new world_property(EEvaluatorId.IS_CAMPING_ENDED, true));
  }
}
