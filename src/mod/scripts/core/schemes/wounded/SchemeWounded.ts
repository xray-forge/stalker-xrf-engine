import {
  alife,
  stalker_ids,
  time_global,
  world_property,
  XR_action_planner,
  XR_alife_simulator,
  XR_game_object,
  XR_ini_file,
} from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { drugs } from "@/mod/globals/items/drugs";
import { STRINGIFIED_FALSE, STRINGIFIED_NIL, STRINGIFIED_TRUE } from "@/mod/globals/lua";
import { AnyObject, Optional, TCount, TRate } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { pstor_retrieve, pstor_store } from "@/mod/scripts/core/database/pstor";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme, action_ids, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { ActionWounded } from "@/mod/scripts/core/schemes/wounded/actions";
import { EvaluatorCanFight, EvaluatorWounded } from "@/mod/scripts/core/schemes/wounded/evaluators";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { getConfigBoolean, getConfigString, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
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
    state: IStoredObject
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

    const state = assignStorageAndBind(object, ini, scheme, section);

    state.wound_manager = new SchemeWounded(object, state);
  }

  /**
   * todo;
   */
  public static override resetScheme(
    npc: XR_game_object,
    scheme: EScheme,
    state: IStoredObject,
    section: TSection
  ): void {
    const woundedSection: TSection =
      scheme === null || scheme === EScheme.NIL
        ? getConfigString(state.ini!, state.section_logic!, "wounded", npc, false, "")
        : getConfigString(state.ini!, section, "wounded", npc, false, "");

    SchemeWounded.initWounded(npc, state.ini!, woundedSection, state.wounded!, scheme);

    state.wounded!.wound_manager.hit_callback();
  }

  /**
   * todo;
   */
  public static initWounded(
    npc: XR_game_object,
    ini: XR_ini_file,
    section: TSection,
    st: IStoredObject,
    scheme: EScheme
  ): void {
    logger.info("Init wounded:", npc.name(), section, scheme);

    if (tostring(section) === st.wounded_section && tostring(section) !== "nil") {
      return;
    }

    st.wounded_section = tostring(section);

    const def: AnyObject = {};
    const npc_community: TCommunity = getCharacterCommunity(npc);

    if (npc_community === communities.monolith) {
      const state = woundedByState[math.mod(npc.id(), 3)];

      def.hp_state = "20|" + state + "@nil";
      def.hp_state_see = "20|" + state + "@nil";
      def.psy_state = "";
      def.hp_victim = "20|nil";
      def.hp_cover = "20|false";
      def.hp_fight = "20|false";
      def.syndata = "";
      def.help_dialog = null;
      def.help_start_dialog = null;
      def.use_medkit = false;
      def.enable_talk = true;
      def.not_for_help = true;
    } else if (npc_community === communities.zombied) {
      def.hp_state = "40|wounded_zombie@nil";
      def.hp_state_see = "40|wounded_zombie@nil";
      def.psy_state = "";
      def.hp_victim = "40|nil";
      def.hp_cover = "40|false";
      def.hp_fight = "40|false";
      def.syndata = "";
      def.help_dialog = null;
      def.help_start_dialog = null;
      def.use_medkit = false;
      def.enable_talk = true;
      def.not_for_help = true;
    } else {
      const state = woundedByState[math.mod(npc.id(), 3)];

      def.hp_state = "20|" + state + "@help_heavy";
      def.hp_state_see = "20|" + state + "@help_heavy";
      def.psy_state =
        "20|{=best_pistol}psy_armed,psy_pain@wounded_psy|20|{=best_pistol}" +
        "psy_shoot,psy_pain@{=best_pistol}wounded_psy_shoot,wounded_psy";
      def.hp_victim = "20|nil";
      def.hp_cover = "20|false";
      def.hp_fight = "20|false";
      def.syndata = "";
      def.help_dialog = "dm_help_wounded_medkit_dialog";
      def.help_start_dialog = null;
      def.use_medkit = true;
      def.enable_talk = true;
      def.not_for_help = false;
    }

    if (tostring(section) === "nil") {
      st.hp_state = parseData(npc, def.hp_state);
      st.hp_state_see = parseData(npc, def.hp_state_see);
      st.psy_state = parseData(npc, def.psy_state);
      st.hp_victim = parseData(npc, def.hp_victim);
      st.hp_cover = parseData(npc, def.hp_cover);
      st.hp_fight = parseData(npc, def.hp_fight);
      st.syndata = parseSynData(npc, def.syndata);
      st.help_dialog = def.help_dialog;
      st.help_start_dialog = null;
      st.use_medkit = def.use_medkit;
      st.autoheal = true;
      st.enable_talk = true;
      st.not_for_help = def.not_for_help;
    } else {
      st.hp_state = parseData(npc, getConfigString(ini, section, "hp_state", npc, false, "", def.hp_state));
      st.hp_state_see = parseData(npc, getConfigString(ini, section, "hp_state_see", npc, false, "", def.hp_state_see));
      st.psy_state = parseData(npc, getConfigString(ini, section, "psy_state", npc, false, "", def.psy_state));
      st.hp_victim = parseData(npc, getConfigString(ini, section, "hp_victim", npc, false, "", def.hp_victim));
      st.hp_cover = parseData(npc, getConfigString(ini, section, "hp_cover", npc, false, "", def.hp_cover));
      st.hp_fight = parseData(npc, getConfigString(ini, section, "hp_fight", npc, false, "", def.hp_fight));
      st.syndata = parseSynData(npc, getConfigString(ini, section, "syndata", npc, false, "", def.syndata));
      st.help_dialog = getConfigString(ini, section, "help_dialog", npc, false, "", def.help_dialog);
      st.help_start_dialog = getConfigString(ini, section, "help_start_dialog", npc, false, "", null);
      st.use_medkit = getConfigBoolean(ini, section, "use_medkit", npc, false, def.use_medkit);
      st.autoheal = getConfigBoolean(ini, section, "autoheal", npc, false, true);
      st.enable_talk = getConfigBoolean(ini, section, "enable_talk", npc, false, true);
      st.not_for_help = getConfigBoolean(ini, section, "not_for_help", npc, false, def.not_for_help);
    }

    st.wounded_set = true;
  }

  /**
   * todo;
   */
  public static unlockMedkit(object: XR_game_object): void {
    const state = registry.objects.get(object.id());

    if (state.wounded !== null) {
      state.wounded!.wound_manager.unlockMedkit();
    }
  }

  /**
   * todo;
   */
  public static eatMedkit(object: XR_game_object): void {
    const state: Optional<IStoredObject> = registry.objects.get(object.id());

    if (state.wounded !== null) {
      state.wounded!.wound_manager.eatMedkit();
    }
  }

  /**
   * todo;
   */
  public static hit_callback(npcId: number): void {
    const state: Optional<IStoredObject> = registry.objects.get(npcId);

    if (state.wounded !== null) {
      state.wounded!.wound_manager.hit_callback();
    }
  }

  /**
   * todo;
   */
  public static is_psy_wounded_by_id(npc_id: number) {
    const state: Optional<IStoredObject> = registry.objects.get(npc_id);

    if (state.wounded !== null) {
      return (
        state.wounded!.wound_manager.wound_state === "psy_pain" ||
        state.wounded!.wound_manager.wound_state === "psy_armed" ||
        state.wounded!.wound_manager.wound_state === "psy_shoot" ||
        state.wounded!.wound_manager.wound_state === "psycho_pain" ||
        state.wounded!.wound_manager.wound_state === "psycho_shoot"
      );
    }

    return false;
  }

  public can_use_medkit: boolean = false;

  public fight!: string;
  public cover!: string;
  public victim!: string;
  public sound!: string;
  public wound_state!: string;

  /**
   * todo;
   */
  public override update(): void {
    const hp: TCount = 100 * this.object.health;
    const psy: TCount = 100 * this.object.psy_health;

    const [nState, nSound] = this.process_psy_wound(psy);

    this.wound_state = nState;
    this.sound = nSound;

    if (this.wound_state === STRINGIFIED_NIL && this.sound === STRINGIFIED_NIL) {
      const [state, sound] = this.process_hp_wound(hp);

      this.wound_state = state;
      this.sound = sound;

      this.fight = this.processFight(hp);
      this.victim = this.process_victim(hp);
    } else {
      this.fight = STRINGIFIED_FALSE;
      this.cover = STRINGIFIED_FALSE;
      this.victim = STRINGIFIED_NIL;
    }

    pstor_store(this.object, "wounded_state", this.wound_state);
    pstor_store(this.object, "wounded_sound", this.sound);
    pstor_store(this.object, "wounded_fight", this.fight);
    pstor_store(this.object, "wounded_victim", this.victim);
  }

  /**
   * todo;
   */
  public unlockMedkit(): void {
    this.can_use_medkit = true;
  }

  /**
   * todo;
   */
  public eatMedkit(): void {
    if (this.can_use_medkit) {
      if (this.object.object("medkit_script") !== null) {
        this.object.eat(this.object.object("medkit_script")!);
      }

      const sim: XR_alife_simulator = alife();

      if (this.object.object(drugs.medkit) !== null) {
        sim.release(sim.object(this.object.object(drugs.medkit)!.id()), true);
      } else if (this.object.object(drugs.medkit_army) !== null) {
        sim.release(sim.object(this.object.object(drugs.medkit_army)!.id()), true);
      } else if (this.object.object(drugs.medkit_scientic) !== null) {
        sim.release(sim.object(this.object.object(drugs.medkit_scientic)!.id()), true);
      }

      const current_time: number = time_global();
      const begin_wounded: Optional<number> = pstor_retrieve(this.object, "begin_wounded");

      if (begin_wounded !== null && current_time - begin_wounded <= 60000) {
        GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), "help_thanks", null, null);
      }

      pstor_store(this.object, "begin_wounded", null);
    }

    this.can_use_medkit = false;
    this.update();
  }

  /**
   * todo;
   */
  public processFight(hp: TRate): string {
    const key = this.getKeyFromDistance(this.state.hp_fight, hp);

    if (key !== null) {
      if (this.state.hp_fight[key].state) {
        return tostring(pickSectionFromCondList(registry.actor, this.object, this.state.hp_fight[key].state));
      }
    }

    return STRINGIFIED_TRUE;
  }

  /**
   * todo;
   */
  public process_victim(hp: TRate): string {
    const key = this.getKeyFromDistance(this.state.hp_victim, hp);

    if (key !== null) {
      if (this.state.hp_victim[key].state) {
        return tostring(pickSectionFromCondList(registry.actor, this.object, this.state.hp_victim[key].state));
      }
    }

    return STRINGIFIED_NIL;
  }

  /**
   * todo;
   */
  public process_hp_wound(hp: TRate): LuaMultiReturn<[string, string]> {
    const key = this.getKeyFromDistance(this.state.hp_state, hp);

    if (key !== null) {
      let r1: Optional<string> = null;
      let r2: Optional<string> = null;

      if (this.object.see(registry.actor)) {
        if (this.state.hp_state_see[key].state) {
          r1 = pickSectionFromCondList(registry.actor, this.object, this.state.hp_state_see[key].state);
        }

        if (this.state.hp_state_see[key].sound) {
          r2 = pickSectionFromCondList(registry.actor, this.object, this.state.hp_state_see[key].sound);
        }
      } else {
        if (this.state.hp_state[key].state) {
          r1 = pickSectionFromCondList(registry.actor, this.object, this.state.hp_state[key].state);
        }

        if (this.state.hp_state[key].sound) {
          r2 = pickSectionFromCondList(registry.actor, this.object, this.state.hp_state[key].sound);
        }
      }

      return $multi(tostring(r1), tostring(r2));
    }

    return $multi(STRINGIFIED_NIL, STRINGIFIED_NIL);
  }

  /**
   * todo;
   */
  public process_psy_wound(hp: number): LuaMultiReturn<[string, string]> {
    const key = this.getKeyFromDistance(this.state.psy_state, hp);

    if (key !== null) {
      let r1: Optional<string> = null;
      let r2: Optional<string> = null;

      if (this.state.psy_state[key].state) {
        r1 = pickSectionFromCondList(registry.actor, this.object, this.state.psy_state[key].state);
      }

      if (this.state.psy_state[key].sound) {
        r2 = pickSectionFromCondList(registry.actor, this.object, this.state.psy_state[key].sound);
      }

      return $multi(tostring(r1), tostring(r2));
    }

    return $multi(STRINGIFIED_NIL, STRINGIFIED_NIL);
  }

  /**
   * todo;
   */
  public getKeyFromDistance(t: LuaTable<string>, hp: TRate): Optional<string> {
    let key: Optional<string> = null;

    for (const [k, v] of t) {
      if (v.dist >= hp) {
        key = k;
      } else {
        return key;
      }
    }

    return key;
  }

  /**
   * todo;
   */
  public hit_callback(): void {
    if (!this.object.alive()) {
      return;
    }

    if (this.object.critically_wounded()) {
      return;
    }

    this.update();
  }
}
