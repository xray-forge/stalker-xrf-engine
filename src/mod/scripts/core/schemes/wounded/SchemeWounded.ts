import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { AnyObject, Maybe, Optional, TNumberId } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme, action_ids, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { ActionWounded } from "@/mod/scripts/core/schemes/wounded/actions";
import { EvaluatorCanFight, EvaluatorWounded } from "@/mod/scripts/core/schemes/wounded/evaluators";
import { ISchemeWoundedState } from "@/mod/scripts/core/schemes/wounded/ISchemeWoundedState";
import { WoundManager } from "@/mod/scripts/core/schemes/wounded/WoundManager";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { getConfigBoolean, getConfigString } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseData, parseSynData } from "@/mod/scripts/utils/parse";

const woundedByState: Record<number, string> = {
  [0]: "wounded_heavy",
  [1]: "wounded_heavy_2",
  [2]: "wounded_heavy_3",
};

const logger: LuaLogger = new LuaLogger("SchemeWounded");

/**
 * todo;
 */
export class SchemeWounded extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.WOUNDED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeWoundedState
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      wounded: action_ids.sidor_act_wounded_base,
    };

    const properties = {
      wounded: evaluators_id.sidor_wounded_base,
      can_fight: evaluators_id.sidor_wounded_base + 1,
    };

    const manager: XR_action_planner = object.motivation_action_manager();

    manager.add_evaluator(properties.wounded, new EvaluatorWounded(state));
    manager.add_evaluator(properties.can_fight, new EvaluatorCanFight(state));

    const action: ActionWounded = new ActionWounded(state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(properties.wounded, true));
    action.add_effect(new world_property(properties.wounded, false));
    action.add_effect(new world_property(stalker_ids.property_enemy, false));
    action.add_effect(new world_property(properties.can_fight, true));

    manager.add_action(operators.wounded, action);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.wounded, false));
    manager.action(stalker_ids.action_gather_items).add_precondition(new world_property(properties.wounded, false));
    manager.action(stalker_ids.action_combat_planner).add_precondition(new world_property(properties.can_fight, true));
    manager.action(stalker_ids.action_danger_planner).add_precondition(new world_property(properties.can_fight, true));
    manager.action(stalker_ids.action_anomaly_planner).add_precondition(new world_property(properties.can_fight, true));
  }

  /**
   * todo;
   */
  public static setWounded(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set wounded:", object.name());

    const state: ISchemeWoundedState = assignStorageAndBind(object, ini, scheme, section);

    state.wound_manager = new WoundManager(object, state);
  }

  /**
   * todo;
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const woundedSection: TSection =
      scheme === null || scheme === EScheme.NIL
        ? getConfigString(state.ini, state.section_logic, "wounded", object, false, "")
        : getConfigString(state.ini, section, "wounded", object, false, "");

    SchemeWounded.initWounded(object, state.ini, woundedSection, state.wounded as ISchemeWoundedState, scheme);

    (state[SchemeWounded.SCHEME_SECTION] as ISchemeWoundedState).wound_manager.hit_callback();
  }

  /**
   * todo;
   */
  public static initWounded(
    object: XR_game_object,
    ini: XR_ini_file,
    section: TSection,
    state: ISchemeWoundedState,
    scheme: EScheme
  ): void {
    logger.info("Init wounded:", object.name(), section, scheme);

    if (tostring(section) === state.wounded_section && tostring(section) !== STRINGIFIED_NIL) {
      return;
    }

    state.wounded_section = tostring(section);

    const objectCommunity: TCommunity = getCharacterCommunity(object);
    const defaults: AnyObject = {};

    // Initialize defaults:
    if (objectCommunity === communities.monolith) {
      const state = woundedByState[math.mod(object.id(), 3)];

      defaults.hp_state = "20|" + state + "@nil";
      defaults.hp_state_see = "20|" + state + "@nil";
      defaults.psy_state = "";
      defaults.hp_victim = "20|nil";
      defaults.hp_cover = "20|false";
      defaults.hp_fight = "20|false";
      defaults.syndata = "";
      defaults.help_dialog = null;
      defaults.help_start_dialog = null;
      defaults.use_medkit = false;
      defaults.enable_talk = true;
      defaults.not_for_help = true;
    } else if (objectCommunity === communities.zombied) {
      defaults.hp_state = "40|wounded_zombie@nil";
      defaults.hp_state_see = "40|wounded_zombie@nil";
      defaults.psy_state = "";
      defaults.hp_victim = "40|nil";
      defaults.hp_cover = "40|false";
      defaults.hp_fight = "40|false";
      defaults.syndata = "";
      defaults.help_dialog = null;
      defaults.help_start_dialog = null;
      defaults.use_medkit = false;
      defaults.enable_talk = true;
      defaults.not_for_help = true;
    } else {
      const state = woundedByState[math.mod(object.id(), 3)];

      defaults.hp_state = "20|" + state + "@help_heavy";
      defaults.hp_state_see = "20|" + state + "@help_heavy";
      defaults.psy_state =
        "20|{=best_pistol}psy_armed,psy_pain@wounded_psy|20|{=best_pistol}" +
        "psy_shoot,psy_pain@{=best_pistol}wounded_psy_shoot,wounded_psy";
      defaults.hp_victim = "20|nil";
      defaults.hp_cover = "20|false";
      defaults.hp_fight = "20|false";
      defaults.syndata = "";
      defaults.help_dialog = "dm_help_wounded_medkit_dialog";
      defaults.help_start_dialog = null;
      defaults.use_medkit = true;
      defaults.enable_talk = true;
      defaults.not_for_help = false;
    }

    // Initialize state:
    if (tostring(section) === STRINGIFIED_NIL) {
      state.hp_state = parseData(object, defaults.hp_state);
      state.hp_state_see = parseData(object, defaults.hp_state_see);
      state.psy_state = parseData(object, defaults.psy_state);
      state.hp_victim = parseData(object, defaults.hp_victim);
      state.hp_cover = parseData(object, defaults.hp_cover);
      state.hp_fight = parseData(object, defaults.hp_fight);
      state.syndata = parseSynData(object, defaults.syndata);
      state.help_dialog = defaults.help_dialog;
      state.help_start_dialog = null;
      state.use_medkit = defaults.use_medkit;
      state.autoheal = true;
      state.enable_talk = true;
      state.not_for_help = defaults.not_for_help;
    } else {
      state.hp_state = parseData(
        object,
        getConfigString(ini, section, "hp_state", object, false, "", defaults.hp_state)
      );
      state.hp_state_see = parseData(
        object,
        getConfigString(ini, section, "hp_state_see", object, false, "", defaults.hp_state_see)
      );
      state.psy_state = parseData(
        object,
        getConfigString(ini, section, "psy_state", object, false, "", defaults.psy_state)
      );
      state.hp_victim = parseData(
        object,
        getConfigString(ini, section, "hp_victim", object, false, "", defaults.hp_victim)
      );
      state.hp_cover = parseData(
        object,
        getConfigString(ini, section, "hp_cover", object, false, "", defaults.hp_cover)
      );
      state.hp_fight = parseData(
        object,
        getConfigString(ini, section, "hp_fight", object, false, "", defaults.hp_fight)
      );
      state.syndata = parseSynData(
        object,
        getConfigString(ini, section, "syndata", object, false, "", defaults.syndata)
      );
      state.help_dialog = getConfigString(ini, section, "help_dialog", object, false, "", defaults.help_dialog);
      state.help_start_dialog = getConfigString(ini, section, "help_start_dialog", object, false, "", null);
      state.use_medkit = getConfigBoolean(ini, section, "use_medkit", object, false, defaults.use_medkit);
      state.autoheal = getConfigBoolean(ini, section, "autoheal", object, false, true);
      state.enable_talk = getConfigBoolean(ini, section, "enable_talk", object, false, true);
      state.not_for_help = getConfigBoolean(ini, section, "not_for_help", object, false, defaults.not_for_help);
    }

    state.wounded_set = true;
  }

  /**
   * todo;
   */
  public static unlockMedkit(object: XR_game_object): void {
    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

    (state?.wounded as Maybe<ISchemeWoundedState>)?.wound_manager.unlockMedkit();
  }

  /**
   * todo;
   */
  public static eatMedkit(object: XR_game_object): void {
    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

    (state?.wounded as Maybe<ISchemeWoundedState>)?.wound_manager.eatMedkit();
  }

  /**
   * todo;
   */
  public static hit_callback(objectId: TNumberId): void {
    const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

    (state?.wounded as Maybe<ISchemeWoundedState>)?.wound_manager.hit_callback();
  }

  /**
   * todo;
   */
  public static is_psy_wounded_by_id(objectId: TNumberId) {
    const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

    if (state.wounded !== null) {
      const woundState = (state?.wounded as Maybe<ISchemeWoundedState>)?.wound_manager.wound_state;

      return (
        woundState === "psy_pain" ||
        woundState === "psy_armed" ||
        woundState === "psy_shoot" ||
        woundState === "psycho_pain" ||
        woundState === "psycho_shoot"
      );
    }

    return false;
  }
}
