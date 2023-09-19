import { world_property } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionWounded } from "@/engine/core/schemes/stalker/wounded/actions";
import { EvaluatorCanFight, EvaluatorWounded } from "@/engine/core/schemes/stalker/wounded/evaluators";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/ISchemeWoundedState";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { IConfigSwitchCondition, parseConditionsList, readIniBoolean, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectCommunity } from "@/engine/core/utils/object/object_get";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, AnyObject, ClientObject, IniFile, LuaArray, Optional, TDistance } from "@/engine/lib/types";
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

  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeWoundedState = AbstractScheme.assign(object, ini, scheme, section);

    state.woundManager = new WoundManager(object, state);
  }

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
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const woundedSection: TSection =
      scheme === null || scheme === EScheme.NIL
        ? readIniString(state.ini, state.sectionLogic, "wounded", false)
        : readIniString(state.ini, section, "wounded", false);

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
    // logger.info("Init wounded:", object.name(), section, scheme);

    if (tostring(section) === state.wounded_section && tostring(section) !== NIL) {
      return;
    }

    state.wounded_section = tostring(section);

    const objectCommunity: TCommunity = getObjectCommunity(object);
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
      state.hp_state = SchemeWounded.parseData(defaults.hp_state);
      state.hp_state_see = SchemeWounded.parseData(defaults.hp_state_see);
      state.psy_state = SchemeWounded.parseData(defaults.psy_state);
      state.hp_victim = SchemeWounded.parseData(defaults.hp_victim);
      state.hp_cover = SchemeWounded.parseData(defaults.hp_cover);
      state.hp_fight = SchemeWounded.parseData(defaults.hp_fight);
      state.help_dialog = defaults.help_dialog;
      state.help_start_dialog = null;
      state.use_medkit = defaults.use_medkit;
      state.autoheal = true;
      state.enable_talk = true;
      state.notForHelp = defaults.not_for_help;
    } else {
      state.hp_state = SchemeWounded.parseData(readIniString(ini, section, "hp_state", false, null, defaults.hp_state));
      state.hp_state_see = SchemeWounded.parseData(
        readIniString(ini, section, "hp_state_see", false, null, defaults.hp_state_see)
      );
      state.psy_state = SchemeWounded.parseData(
        readIniString(ini, section, "psy_state", false, null, defaults.psy_state)
      );
      state.hp_victim = SchemeWounded.parseData(
        readIniString(ini, section, "hp_victim", false, null, defaults.hp_victim)
      );
      state.hp_cover = SchemeWounded.parseData(readIniString(ini, section, "hp_cover", false, null, defaults.hp_cover));
      state.hp_fight = SchemeWounded.parseData(readIniString(ini, section, "hp_fight", false, null, defaults.hp_fight));
      state.help_dialog = readIniString(ini, section, "help_dialog", false, null, defaults.help_dialog);
      state.help_start_dialog = readIniString(ini, section, "help_start_dialog", false, null, null);
      state.use_medkit = readIniBoolean(ini, section, "use_medkit", false, defaults.use_medkit);
      state.autoheal = readIniBoolean(ini, section, "autoheal", false, true);
      state.enable_talk = readIniBoolean(ini, section, "enable_talk", false, true);
      state.notForHelp = readIniBoolean(ini, section, "not_for_help", false, defaults.not_for_help);
    }

    state.wounded_set = true;
  }

  /**
   * todo;
   */
  private static parseData(target: Optional<string>): LuaArray<{
    dist: Optional<TDistance>;
    state: Optional<LuaArray<IConfigSwitchCondition>>;
    sound: Optional<LuaArray<IConfigSwitchCondition>>;
  }> {
    const collection: LuaArray<any> = new LuaTable();

    if (target) {
      for (const name of string.gfind(target, "(%|*%d+%|[^%|]+)%p*")) {
        const dat = {
          dist: null as Optional<number>,
          state: null as Optional<LuaArray<IConfigSwitchCondition>>,
          sound: null as Optional<LuaArray<IConfigSwitchCondition>>,
        };

        const [tPosition] = string.find(name, "|", 1, true);
        const [sPosition] = string.find(name, "@", 1, true);

        const dist = string.sub(name, 1, tPosition - 1);

        let state: Optional<string> = null;
        let sound: Optional<string> = null;

        if (sPosition !== null) {
          state = string.sub(name, tPosition + 1, sPosition - 1);
          sound = string.sub(name, sPosition + 1);
        } else {
          state = string.sub(name, tPosition + 1);
        }

        dat.dist = tonumber(dist)!;

        if (state !== null) {
          dat.state = parseConditionsList(state);
        }

        if (sound !== null) {
          dat.sound = parseConditionsList(sound);
        }

        table.insert(collection, dat);
      }
    }

    return collection;
  }
}
