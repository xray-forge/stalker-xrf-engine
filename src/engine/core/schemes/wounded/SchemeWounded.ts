import { stalker_ids, world_property } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ActionWounded } from "@/engine/core/schemes/wounded/actions";
import { EvaluatorCanFight, EvaluatorWounded } from "@/engine/core/schemes/wounded/evaluators";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded/ISchemeWoundedState";
import { WoundManager } from "@/engine/core/schemes/wounded/WoundManager";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/getters";
import { parseData, parseSynData } from "@/engine/core/utils/ini/parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity } from "@/engine/core/utils/object/object_general";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, AnyObject, ClientObject, IniFile, Maybe, Optional, TNumberId } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const woundedByState: Record<number, string> = {
  [0]: "wounded_heavy",
  [1]: "wounded_heavy_2",
  [2]: "wounded_heavy_3",
};

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeWounded extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.WOUNDED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeWoundedState = AbstractScheme.assign(object, ini, scheme, section);

    state.woundManager = new WoundManager(object, state);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeWoundedState
  ): void {
    const manager: ActionPlanner = object.motivation_action_manager();

    manager.add_evaluator(EEvaluatorId.IS_WOUNDED, new EvaluatorWounded(state));
    manager.add_evaluator(EEvaluatorId.CAN_FIGHT, new EvaluatorCanFight(state));

    const action: ActionWounded = new ActionWounded(state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, true));
    action.add_effect(new world_property(EEvaluatorId.IS_WOUNDED, false));
    action.add_effect(new world_property(stalker_ids.property_enemy, false));
    action.add_effect(new world_property(EEvaluatorId.CAN_FIGHT, true));

    manager.add_action(EActionId.BECOME_WOUNDED, action);

    manager.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    manager
      .action(stalker_ids.action_gather_items)
      .add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    manager
      .action(stalker_ids.action_combat_planner)
      .add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
    manager
      .action(stalker_ids.action_danger_planner)
      .add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
    manager
      .action(stalker_ids.action_anomaly_planner)
      .add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
  }

  /**
   * todo: Description.
   */
  public static override reset(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const woundedSection: TSection =
      scheme === null || scheme === EScheme.NIL
        ? readIniString(state.ini, state.section_logic, "wounded", false, "")
        : readIniString(state.ini, section, "wounded", false, "");

    SchemeWounded.initialize(object, state.ini, woundedSection, state.wounded as ISchemeWoundedState, scheme);

    (state[SchemeWounded.SCHEME_SECTION] as ISchemeWoundedState).woundManager.onHit();
  }

  /**
   * todo: Description.
   */
  public static initialize(
    object: ClientObject,
    ini: IniFile,
    section: TSection,
    state: ISchemeWoundedState,
    scheme: EScheme
  ): void {
    logger.info("Init wounded:", object.name(), section, scheme);

    if (tostring(section) === state.wounded_section && tostring(section) !== NIL) {
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
    if (tostring(section) === NIL) {
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
      state.hp_state = parseData(object, readIniString(ini, section, "hp_state", false, "", defaults.hp_state));
      state.hp_state_see = parseData(
        object,
        readIniString(ini, section, "hp_state_see", false, "", defaults.hp_state_see)
      );
      state.psy_state = parseData(object, readIniString(ini, section, "psy_state", false, "", defaults.psy_state));
      state.hp_victim = parseData(object, readIniString(ini, section, "hp_victim", false, "", defaults.hp_victim));
      state.hp_cover = parseData(object, readIniString(ini, section, "hp_cover", false, "", defaults.hp_cover));
      state.hp_fight = parseData(object, readIniString(ini, section, "hp_fight", false, "", defaults.hp_fight));
      state.syndata = parseSynData(object, readIniString(ini, section, "syndata", false, "", defaults.syndata));
      state.help_dialog = readIniString(ini, section, "help_dialog", false, "", defaults.help_dialog);
      state.help_start_dialog = readIniString(ini, section, "help_start_dialog", false, "", null);
      state.use_medkit = readIniBoolean(ini, section, "use_medkit", false, defaults.use_medkit);
      state.autoheal = readIniBoolean(ini, section, "autoheal", false, true);
      state.enable_talk = readIniBoolean(ini, section, "enable_talk", false, true);
      state.not_for_help = readIniBoolean(ini, section, "not_for_help", false, defaults.not_for_help);
    }

    state.wounded_set = true;
  }

  /**
   * todo: Description.
   */
  public static unlockMedkit(object: ClientObject): void {
    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

    (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.unlockMedkit();
  }

  /**
   * todo: Description.
   */
  public static eatMedkit(object: ClientObject): void {
    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

    (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.eatMedkit();
  }

  /**
   * todo: Description.
   */
  public static onHit(objectId: TNumberId): void {
    const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

    (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.onHit();
  }

  /**
   * todo: Description.
   */
  public static isPsyWoundedById(objectId: TNumberId): boolean {
    const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

    if (state.wounded !== null) {
      const woundState = (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.woundState;

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
