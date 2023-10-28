import { world_property } from "xray16";

import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { IRegistryObjectState } from "@/engine/core/database";
import { ActionWounded } from "@/engine/core/schemes/stalker/wounded/actions";
import { EvaluatorCanFight, EvaluatorWounded } from "@/engine/core/schemes/stalker/wounded/evaluators";
import { parseWoundedData } from "@/engine/core/schemes/stalker/wounded/utils";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, AnyObject, GameObject, IniFile, LuaArray, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme to capture stalker logic and lay wounded / call for help.
 */
export class SchemeWounded extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.WOUNDED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static WOUNDED_STATES: LuaArray<TName> = $fromArray(["wounded_heavy", "wounded_heavy_2", "wounded_heavy_3"]);

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeWoundedState {
    const state: ISchemeWoundedState = AbstractScheme.assign(object, ini, scheme, section);

    state.woundManager = new WoundManager(object, state);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeWoundedState
  ): void {
    const manager: ActionPlanner = object.motivation_action_manager();

    manager.add_evaluator(EEvaluatorId.IS_WOUNDED, new EvaluatorWounded(state));
    manager.add_evaluator(EEvaluatorId.CAN_FIGHT, new EvaluatorCanFight(state));

    const action: ActionWounded = new ActionWounded(state);

    action.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, true));
    action.add_effect(new world_property(EEvaluatorId.IS_WOUNDED, false));
    action.add_effect(new world_property(EEvaluatorId.ENEMY, false));
    action.add_effect(new world_property(EEvaluatorId.CAN_FIGHT, true));

    manager.add_action(EActionId.BECOME_WOUNDED, action);

    manager.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    manager.action(EActionId.GATHER_ITEMS).add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    manager.action(EActionId.COMBAT).add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
    manager.action(EActionId.DANGER).add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
    manager.action(EActionId.ANOMALY).add_precondition(new world_property(EEvaluatorId.CAN_FIGHT, true));
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const woundedSection: TSection =
      scheme === null || scheme === EScheme.NIL
        ? readIniString(state.ini, state.sectionLogic, "wounded", false)
        : readIniString(state.ini, section, "wounded", false);

    SchemeWounded.initialize(object, state.ini, woundedSection, state[EScheme.WOUNDED] as ISchemeWoundedState);

    (state[SchemeWounded.SCHEME_SECTION] as ISchemeWoundedState).woundManager.onHit();
  }

  /**
   * todo: Description.
   */
  public static initialize(object: GameObject, ini: IniFile, section: TSection, state: ISchemeWoundedState): void {
    // logger.info("Init wounded:", object.name(), section, scheme);

    if (tostring(section) === state.woundedSection && tostring(section) !== NIL) {
      return;
    }

    state.woundedSection = tostring(section);

    const objectCommunity: TCommunity = getObjectCommunity(object);
    const defaults: AnyObject = {};

    // Initialize defaults:
    if (objectCommunity === communities.monolith) {
      const state = SchemeWounded.WOUNDED_STATES.get(math.mod(object.id(), 3) + 1);

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
      const state = SchemeWounded.WOUNDED_STATES.get(math.mod(object.id(), 3) + 1);

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
      state.hpState = parseWoundedData(defaults.hp_state);
      state.hpStateSee = parseWoundedData(defaults.hp_state_see);
      state.psyState = parseWoundedData(defaults.psy_state);
      state.hpVictim = parseWoundedData(defaults.hp_victim);
      state.hpCover = parseWoundedData(defaults.hp_cover);
      state.hpFight = parseWoundedData(defaults.hp_fight);
      state.helpDialog = defaults.help_dialog;
      state.helpStartDialog = null;
      state.useMedkit = defaults.use_medkit;
      state.autoheal = true;
      state.isTalkEnabled = true;
      state.isNotForHelp = defaults.not_for_help;
    } else {
      state.hpState = parseWoundedData(readIniString(ini, section, "hp_state", false, null, defaults.hp_state));
      state.hpStateSee = parseWoundedData(
        readIniString(ini, section, "hp_state_see", false, null, defaults.hp_state_see)
      );
      state.psyState = parseWoundedData(readIniString(ini, section, "psy_state", false, null, defaults.psy_state));
      state.hpVictim = parseWoundedData(readIniString(ini, section, "hp_victim", false, null, defaults.hp_victim));
      state.hpCover = parseWoundedData(readIniString(ini, section, "hp_cover", false, null, defaults.hp_cover));
      state.hpFight = parseWoundedData(readIniString(ini, section, "hp_fight", false, null, defaults.hp_fight));
      state.helpDialog = readIniString(ini, section, "help_dialog", false, null, defaults.help_dialog);
      state.helpStartDialog = readIniString(ini, section, "help_start_dialog", false, null, null);
      state.useMedkit = readIniBoolean(ini, section, "use_medkit", false, defaults.use_medkit);
      state.autoheal = readIniBoolean(ini, section, "autoheal", false, true);
      state.isTalkEnabled = readIniBoolean(ini, section, "enable_talk", false, true);
      state.isNotForHelp = readIniBoolean(ini, section, "not_for_help", false, defaults.not_for_help);
    }

    state.isWoundedInitialized = true;
  }
}
