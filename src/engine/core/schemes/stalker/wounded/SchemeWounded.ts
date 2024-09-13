import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState } from "@/engine/core/database";
import { ActionWounded } from "@/engine/core/schemes/stalker/wounded/actions";
import { EvaluatorCanFight, EvaluatorWounded } from "@/engine/core/schemes/stalker/wounded/evaluators";
import { parseWoundedData } from "@/engine/core/schemes/stalker/wounded/utils";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, GameObject, IniFile, LuaArray, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

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

    SchemeWounded.initializeWoundedState(
      object,
      state.ini,
      woundedSection,
      state[EScheme.WOUNDED] as ISchemeWoundedState
    );

    (state[SchemeWounded.SCHEME_SECTION] as ISchemeWoundedState).woundManager.onHit();
  }

  /**
   * Initialize object wounded scheme configuration from ini file or use already parsed cached values.
   *
   * @param object - target game object to initialize state
   * @param ini - ini file with current logics configuration
   * @param section - wounded scheme section to use for config initialization
   * @param state - object wounded scheme state
   */
  public static initializeWoundedState(
    object: GameObject,
    ini: IniFile,
    section: TSection,
    state: ISchemeWoundedState
  ): void {
    // Do not parse scheme state from ini file over and over again.
    if (tostring(section) === state.woundedSection && tostring(section) !== NIL) {
      return;
    } else {
      state.woundedSection = tostring(section);
    }

    const objectCommunity: TCommunity = getObjectCommunity(object);
    const woundState: TSection = SchemeWounded.WOUNDED_STATES.get(math.mod(object.id(), 3) + 1);

    let defaults;

    switch (objectCommunity) {
      case communities.monolith:
        defaults = {
          hpState: `20|${woundState}@nil`,
          hpStateSee: `20|${woundState}@nil`,
          psyState: "",
          hpVictim: "20|nil",
          hpCover: "20|false",
          hpFight: "20|false",
          syndata: "",
          helpDialog: null,
          helpStartDialog: null,
          useMedkit: false,
          enableTalk: true,
          notForHelp: true,
        };
        break;

      case communities.zombied:
        defaults = {
          hpState: "40|wounded_zombie@nil",
          hpStateSee: "40|wounded_zombie@nil",
          psyState: "",
          hpVictim: "40|nil",
          hpCover: "40|false",
          hpFight: "40|false",
          syndata: "",
          helpDialog: null,
          helpStartDialog: null,
          useMedkit: false,
          enable_talk: true,
          notForHelp: true,
        };
        break;

      default:
        defaults = {
          hpState: `20|${woundState}@help_heavy`,
          hpStateSee: `20|${woundState}@help_heavy`,
          psyState:
            "20|{=best_pistol}psy_armed,psy_pain@wounded_psy|20|{=best_pistol}" +
            "psy_shoot,psy_pain@{=best_pistol}wounded_psy_shoot,wounded_psy",
          hpVictim: "20|nil",
          hpCover: "20|false",
          hpFight: "20|false",
          syndata: "",
          helpDialog: "dm_help_wounded_medkit_dialog",
          helpStartDialog: null,
          useMedkit: true,
          enableTalk: true,
          notForHelp: false,
        };
        break;
    }

    // Initialize state with defaults:
    if (tostring(section) === NIL) {
      state.hpState = parseWoundedData(defaults.hpState);
      state.hpStateSee = parseWoundedData(defaults.hpStateSee);
      state.psyState = parseWoundedData(defaults.psyState);
      state.hpVictim = parseWoundedData(defaults.hpVictim);
      state.hpCover = parseWoundedData(defaults.hpCover);
      state.hpFight = parseWoundedData(defaults.hpFight);
      state.helpDialog = defaults.helpDialog;
      state.helpStartDialog = null;
      state.canUseMedkit = defaults.useMedkit;
      state.isAutoHealing = true;
      state.isTalkEnabled = true;
      state.isNotForHelp = defaults.notForHelp;
    } else {
      // Initialize state from section:
      state.hpState = parseWoundedData(readIniString(ini, section, "hp_state", false, null, defaults.hpState));
      state.hpStateSee = parseWoundedData(
        readIniString(ini, section, "hp_state_see", false, null, defaults.hpStateSee)
      );
      state.psyState = parseWoundedData(readIniString(ini, section, "psy_state", false, null, defaults.psyState));
      state.hpVictim = parseWoundedData(readIniString(ini, section, "hp_victim", false, null, defaults.hpVictim));
      state.hpCover = parseWoundedData(readIniString(ini, section, "hp_cover", false, null, defaults.hpCover));
      state.hpFight = parseWoundedData(readIniString(ini, section, "hp_fight", false, null, defaults.hpFight));
      state.helpDialog = readIniString(ini, section, "help_dialog", false, null, defaults.helpDialog);
      state.helpStartDialog = readIniString(ini, section, "help_start_dialog");
      state.canUseMedkit = readIniBoolean(ini, section, "use_medkit", false, defaults.useMedkit);
      state.isAutoHealing = readIniBoolean(ini, section, "autoheal", false, true);
      state.isTalkEnabled = readIniBoolean(ini, section, "enable_talk", false, true);
      state.isNotForHelp = readIniBoolean(ini, section, "not_for_help", false, defaults.notForHelp);
    }

    state.isWoundedInitialized = true;
  }
}
