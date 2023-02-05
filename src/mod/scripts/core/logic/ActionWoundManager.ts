import {
  alife,
  stalker_ids,
  time_global,
  world_property,
  XR_action_planner,
  XR_alife_simulator,
  XR_game_object,
  XR_ini_file
} from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { AnyCallablesModule, AnyObject, Optional } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { stringifyAsJson } from "@/mod/lib/utils/json";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionWounded, IActionWounded } from "@/mod/scripts/core/logic/actions/ActionWounded";
import { EvaluatorCanFight } from "@/mod/scripts/core/logic/evaluators/EvaluatorCanFight";
import { EvaluatorWounded } from "@/mod/scripts/core/logic/evaluators/EvaluatorWounded";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import {
  getConfigBoolean,
  getConfigString,
  parse_data,
  parse_syn_data,
  pickSectionFromCondList
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const wounded_by_state: Record<number, string> = {
  [0]: "wounded_heavy",
  [1]: "wounded_heavy_2",
  [2]: "wounded_heavy_3"
};

const logger: LuaLogger = new LuaLogger("ActionWoundManager");

export class ActionWoundManager extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "wounded";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      wounded: action_ids.sidor_act_wounded_base
    };

    const properties = {
      wounded: evaluators_id.sidor_wounded_base,
      can_fight: evaluators_id.sidor_wounded_base + 1
    };

    const manager: XR_action_planner = object.motivation_action_manager();

    manager.add_evaluator(properties.wounded, create_xr_class_instance(EvaluatorWounded, "wounded", state));
    manager.add_evaluator(properties.can_fight, create_xr_class_instance(EvaluatorCanFight, "can_fight", state));

    const action: IActionWounded = create_xr_class_instance(ActionWounded, "wounded_action", state);

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

  public static set_wounded(object: XR_game_object, ini: XR_ini_file, scheme: TScheme, section: TSection): void {
    logger.info("Set wounded:", object.name());

    const state = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    state.wound_manager = new ActionWoundManager(object, state);
  }

  public static reset_wounded(npc: XR_game_object, scheme: TScheme, state: IStoredObject, section: TSection): void {
    const wounded_section: TSection =
      scheme === null || scheme === "nil"
        ? getConfigString(state.ini!, state.section_logic!, "wounded", npc, false, "")
        : getConfigString(state.ini!, section, "wounded", npc, false, "");

    ActionWoundManager.init_wounded(npc, state.ini!, wounded_section, state.wounded!, scheme);

    state.wounded!.wound_manager.hit_callback();
  }

  public static init_wounded(
    npc: XR_game_object,
    ini: XR_ini_file,
    section: TSection,
    st: IStoredObject,
    scheme: TScheme
  ): void {
    logger.info("Init wounded:", npc.name(), section, scheme);

    if (tostring(section) === st.wounded_section && tostring(section) !== "nil") {
      return;
    }

    st.wounded_section = tostring(section);

    const def: AnyObject = {};
    const npc_community: TCommunity = getCharacterCommunity(npc);

    if (npc_community === communities.monolith) {
      const state = wounded_by_state[math.mod(npc.id(), 3)];

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
      const state = wounded_by_state[math.mod(npc.id(), 3)];

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
      st.hp_state = parse_data(npc, def.hp_state);
      st.hp_state_see = parse_data(npc, def.hp_state_see);
      st.psy_state = parse_data(npc, def.psy_state);
      st.hp_victim = parse_data(npc, def.hp_victim);
      st.hp_cover = parse_data(npc, def.hp_cover);
      st.hp_fight = parse_data(npc, def.hp_fight);
      st.syndata = parse_syn_data(npc, def.syndata);
      st.help_dialog = def.help_dialog;
      st.help_start_dialog = null;
      st.use_medkit = def.use_medkit;
      st.autoheal = true;
      st.enable_talk = true;
      st.not_for_help = def.not_for_help;
    } else {
      st.hp_state = parse_data(npc, getConfigString(ini, section, "hp_state", npc, false, "", def.hp_state));
      st.hp_state_see = parse_data(
        npc,
        getConfigString(ini, section, "hp_state_see", npc, false, "", def.hp_state_see)
      );
      st.psy_state = parse_data(npc, getConfigString(ini, section, "psy_state", npc, false, "", def.psy_state));
      st.hp_victim = parse_data(npc, getConfigString(ini, section, "hp_victim", npc, false, "", def.hp_victim));
      st.hp_cover = parse_data(npc, getConfigString(ini, section, "hp_cover", npc, false, "", def.hp_cover));
      st.hp_fight = parse_data(npc, getConfigString(ini, section, "hp_fight", npc, false, "", def.hp_fight));
      st.syndata = parse_syn_data(npc, getConfigString(ini, section, "syndata", npc, false, "", def.syndata));
      st.help_dialog = getConfigString(ini, section, "help_dialog", npc, false, "", def.help_dialog);
      st.help_start_dialog = getConfigString(ini, section, "help_start_dialog", npc, false, "", null);
      st.use_medkit = getConfigBoolean(ini, section, "use_medkit", npc, false, def.use_medkit);
      st.autoheal = getConfigBoolean(ini, section, "autoheal", npc, false, true);
      st.enable_talk = getConfigBoolean(ini, section, "enable_talk", npc, false, true);
      st.not_for_help = getConfigBoolean(ini, section, "not_for_help", npc, false, def.not_for_help);
    }

    st.wounded_set = true;
  }

  public static is_wounded(npc: XR_game_object): boolean {
    const state = storage.get(npc.id());

    if (state === null) {
      return false;
    } else if (state.wounded !== null) {
      return tostring(state.wounded!.wound_manager.wound_state) !== "nil";
    } else {
      return false;
    }
  }

  public static unlock_medkit(npc: XR_game_object): void {
    const state = storage.get(npc.id());

    if (state.wounded !== null) {
      state.wounded!.wound_manager.unlock_medkit();
    }
  }

  public static eat_medkit(npc: XR_game_object): void {
    const state: Optional<IStoredObject> = storage.get(npc.id());

    if (state.wounded !== null) {
      state.wounded!.wound_manager.eat_medkit();
    }
  }

  public static hit_callback(npcId: number): void {
    const state: Optional<IStoredObject> = storage.get(npcId);

    if (state.wounded !== null) {
      state.wounded!.wound_manager.hit_callback();
    }
  }

  public static is_heavy_wounded_by_id(npcId: number): boolean {
    const state: Optional<IStoredObject> = storage.get(npcId);

    if (state.wounded !== null) {
      return tostring(state.wounded!.wound_manager.wound_state) !== "nil";
    }

    return false;
  }

  public static is_psy_wounded_by_id(npc_id: number) {
    const state: Optional<IStoredObject> = storage.get(npc_id);

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

  public update(): void {
    const hp = 100 * this.object.health;
    const psy = 100 * this.object.psy_health;

    const [nState, nSound] = this.process_psy_wound(psy);

    this.wound_state = nState;
    this.sound = nSound;

    if (this.wound_state === "nil" && this.sound === "nil") {
      const [state, sound] = this.process_hp_wound(hp);

      this.wound_state = state;
      this.sound = sound;

      this.fight = this.process_fight(hp);
      this.victim = this.process_victim(hp);
    } else {
      this.fight = "false";
      this.cover = "false";
      this.victim = "nil";
    }

    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "wounded_state", this.wound_state);
    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "wounded_sound", this.sound);
    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "wounded_fight", this.fight);
    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "wounded_victim", this.victim);
  }

  public unlock_medkit(): void {
    this.can_use_medkit = true;
  }

  public eat_medkit(): void {
    if (this.can_use_medkit) {
      if (this.object.object("medkit_script") !== null) {
        this.object.eat(this.object.object("medkit_script")!);
      }

      const sim: XR_alife_simulator = alife();

      if (this.object.object("medkit") !== null) {
        sim.release(sim.object(this.object.object("medkit")!.id()), true);
      } else if (this.object.object("medkit_army") !== null) {
        sim.release(sim.object(this.object.object("medkit_army")!.id()), true);
      } else if (this.object.object("medkit_scientic") !== null) {
        sim.release(sim.object(this.object.object("medkit_scientic")!.id()), true);
      }

      const current_time: number = time_global();
      const begin_wounded: Optional<number> = get_global<AnyCallablesModule>("xr_logic").pstor_retrieve(
        this.object,
        "begin_wounded"
      );

      if (begin_wounded !== null && current_time - begin_wounded <= 60000) {
        GlobalSound.set_sound_play(this.object.id(), "help_thanks", null, null);
      }

      get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "begin_wounded", null);
    }

    this.can_use_medkit = false;
    this.update();
  }

  public process_fight(hp: number): string {
    const key = this.get_key_from_distance(this.state.hp_fight, hp);

    if (key !== null) {
      if (this.state.hp_fight[key].state) {
        return tostring(pickSectionFromCondList(getActor(), this.object, this.state.hp_fight[key].state));
      }
    }

    return "true";
  }

  public process_victim(hp: number): string {
    const key = this.get_key_from_distance(this.state.hp_victim, hp);

    if (key !== null) {
      if (this.state.hp_victim[key].state) {
        return tostring(pickSectionFromCondList(getActor(), this.object, this.state.hp_victim[key].state));
      }
    }

    return "nil";
  }

  public process_hp_wound(hp: number): LuaMultiReturn<[string, string]> {
    const key = this.get_key_from_distance(this.state.hp_state, hp);

    if (key !== null) {
      let r1: Optional<string> = null;
      let r2: Optional<string> = null;

      if (this.object.see(getActor()!)) {
        if (this.state.hp_state_see[key].state) {
          r1 = pickSectionFromCondList(getActor(), this.object, this.state.hp_state_see[key].state);
        }

        if (this.state.hp_state_see[key].sound) {
          r2 = pickSectionFromCondList(getActor(), this.object, this.state.hp_state_see[key].sound);
        }
      } else {
        if (this.state.hp_state[key].state) {
          r1 = pickSectionFromCondList(getActor(), this.object, this.state.hp_state[key].state);
        }

        if (this.state.hp_state[key].sound) {
          r2 = pickSectionFromCondList(getActor(), this.object, this.state.hp_state[key].sound);
        }
      }

      return $multi(tostring(r1), tostring(r2));
    }

    return $multi("nil", "nil");
  }

  public process_psy_wound(hp: number): LuaMultiReturn<[string, string]> {
    const key = this.get_key_from_distance(this.state.psy_state, hp);

    if (key !== null) {
      let r1: Optional<string> = null;
      let r2: Optional<string> = null;

      if (this.state.psy_state[key].state) {
        r1 = pickSectionFromCondList(getActor(), this.object, this.state.psy_state[key].state);
      }

      if (this.state.psy_state[key].sound) {
        r2 = pickSectionFromCondList(getActor(), this.object, this.state.psy_state[key].sound);
      }

      return $multi(tostring(r1), tostring(r2));
    }

    return $multi("nil", "nil");
  }

  public get_key_from_distance(t: LuaTable<string>, hp: number): Optional<string> {
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

  public hit_callback(): void {
    if (this.object.alive() === false) {
      return;
    }

    if (this.object.critically_wounded() === true) {
      return;
    }

    this.update();
  }
}
