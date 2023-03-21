import { stalker_ids, world_property, XR_action_base, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme, action_ids, evaluators_id } from "@/engine/core/schemes/base";
import { ActionCamperPatrol } from "@/engine/core/schemes/camper/actions";
import { EvaluatorCloseCombat, EvaluatorEnd } from "@/engine/core/schemes/camper/evaluators";
import { ISchemeCamperState } from "@/engine/core/schemes/camper/ISchemeCamperState";
import { abort } from "@/engine/core/utils/debug";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { RADIAN } from "@/engine/lib/constants/math";
import { FALSE } from "@/engine/lib/constants/words";
import { EScheme, ESchemeType, Optional, TSection } from "@/engine/lib/types";

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
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCamperState
  ): void {
    const operators = {
      patrol: action_ids.stohe_camper_base + 1,
      search_corpse: action_ids.corpse_exist,
      help_wounded: action_ids.wounded_exist,
    };
    const properties = {
      end: evaluators_id.stohe_camper_base + 1,
      can_fight: evaluators_id.sidor_wounded_base + 1,
      close_combat: evaluators_id.stohe_camper_base + 2,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(properties.end, new EvaluatorEnd(state));
    manager.add_evaluator(properties.close_combat, new EvaluatorCloseCombat(state));

    const actionPatrol: ActionCamperPatrol = new ActionCamperPatrol(state, object);

    actionPatrol.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionPatrol.add_precondition(new world_property(properties.end, false));
    actionPatrol.add_precondition(new world_property(properties.close_combat, false));
    actionPatrol.add_precondition(new world_property(properties.can_fight, true));
    actionPatrol.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionPatrol.add_precondition(new world_property(stalker_ids.property_anomaly, false));

    actionPatrol.add_precondition(new world_property(evaluators_id.stohe_meet_base + 1, false));
    actionPatrol.add_precondition(new world_property(evaluators_id.sidor_wounded_base + 0, false));
    actionPatrol.add_precondition(new world_property(evaluators_id.abuse_base, false));

    actionPatrol.add_effect(new world_property(properties.end, true));
    actionPatrol.add_effect(new world_property(stalker_ids.property_enemy, false));
    actionPatrol.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.patrol, actionPatrol);
    SchemeCamper.subscribeToSchemaEvents(object, state, actionPatrol);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.end, true));
    manager.action(stalker_ids.action_gather_items).add_precondition(new world_property(properties.end, true));
    manager.action(operators.search_corpse).add_precondition(new world_property(properties.end, true));
    manager.action(operators.help_wounded).add_precondition(new world_property(properties.end, true));

    const actionCombatPlanner: XR_action_base = manager.action(stalker_ids.action_combat_planner);

    actionCombatPlanner.add_precondition(new world_property(properties.close_combat, true));
    actionCombatPlanner.add_effect(new world_property(properties.close_combat, false));
    actionCombatPlanner.add_effect(new world_property(properties.state_mgr_logic_active, false));
    actionCombatPlanner.add_effect(new world_property(properties.end, true));
  }

  /**
   * todo: Description.
   */
  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeCamperState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.path_walk = getConfigString(ini, section, "path_walk", object, true, additional);
    state.path_look = getConfigString(ini, section, "path_look", object, true, additional);

    if (state.path_walk === state.path_look) {
      abort(
        "You are trying to set 'path_look' equal to 'path_walk' in section [%s] for npc [%s]",
        section,
        object.name()
      );
    }

    state.sniper = getConfigBoolean(ini, section, "sniper", object, false);
    state.no_retreat = getConfigBoolean(ini, section, "no_retreat", object, false);
    state.shoot = getConfigString(ini, section, "shoot", object, false, "", "always");
    state.sniper_anim = getConfigString(ini, section, "sniper_anim", object, false, "hide_na");

    if (state.sniper === true && state.no_retreat === true) {
      abort("ERROR: NPC [%s] Section [%s]. No_retreat not available for SNIPER.", object.name(), section);
    }

    state.radius = getConfigNumber(ini, section, "radius", object, false, 20);

    const campering: Optional<string> = getConfigString(ini, section, "def_state_campering", object, false);

    state.suggested_state = {
      moving: getConfigString(ini, section, "def_state_moving", object, false),
      moving_fire: getConfigString(ini, section, "def_state_moving_fire", object, false),
      campering: campering,
      standing: getConfigString(ini, section, "def_state_standing", object, false, "", campering),
      campering_fire: getConfigString(ini, section, "def_state_campering_fire", object, false),
    };

    state.scantime_free = getConfigNumber(ini, section, "scantime_free", object, false, 60_000);
    state.attack_sound = getConfigString(ini, section, "attack_sound", object, false, "", "fight_attack");

    if (state.attack_sound === FALSE) {
      state.attack_sound = null;
    }

    state.idle = getConfigNumber(ini, section, "enemy_idle", object, false, 60_000);
    state.post_enemy_wait = 5_000;
    state.enemy_disp = 7 / RADIAN;

    state.scandelta = 30;
    state.timedelta = 4000;
    state.time_scan_delta = state.timedelta / state.scandelta;
  }
}
