import {
  alife,
  device,
  game_object,
  stalker_ids,
  world_property,
  XR_action_planner,
  XR_game_object,
  XR_ini_file,
} from "xray16";

import { AnyCallablesModule, AnyObject, Optional } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { get_npcs_relation } from "@/mod/scripts/core/game_relations";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { AbuseManager } from "@/mod/scripts/core/logic/AbuseManager";
import { ActionCorpseDetect } from "@/mod/scripts/core/logic/ActionCorpseDetect";
import { ActionMeetWait, IActionMeetWait } from "@/mod/scripts/core/logic/actions/ActionMeetWait";
import { ActionSchemeHelpWounded } from "@/mod/scripts/core/logic/ActionSchemeHelpWounded";
import { EvaluatorContact } from "@/mod/scripts/core/logic/evaluators/EvaluatorContact";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { getStoryObject, is_npc_in_combat } from "@/mod/scripts/utils/alife";
import { isObjectWounded } from "@/mod/scripts/utils/checkers";
import { getConfigString, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";

export class ActionSchemeMeet extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "meet";
  public static readonly SCHEME_SECTION_ADDITIONAL: string = "actor_dialogs";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    const operators = {
      contact: action_ids.stohe_meet_base + 1,
      state_mgr_to_idle_alife: action_ids.state_mgr + 2,
    };

    const properties = {
      contact: evaluators_id.stohe_meet_base + 1,
      wounded: evaluators_id.sidor_wounded_base,
      abuse: evaluators_id.abuse_base,
      wounded_exist: evaluators_id.wounded_exist,
      corpse_exist: evaluators_id.corpse_exist,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    // -- Evaluators
    actionPlanner.add_evaluator(
      properties.contact,
      create_xr_class_instance(EvaluatorContact, EvaluatorContact.__name, state)
    );

    // -- Actions
    const actionMeetWait: IActionMeetWait = create_xr_class_instance(
      ActionMeetWait,
      object.name(),
      ActionMeetWait.__name,
      state,
      ini
    );

    actionMeetWait.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionMeetWait.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionMeetWait.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionMeetWait.add_precondition(new world_property(stalker_ids.property_anomaly, false));

    actionMeetWait.add_precondition(new world_property(stalker_ids.property_items, false));
    actionMeetWait.add_precondition(new world_property(properties.wounded_exist, false));
    actionMeetWait.add_precondition(new world_property(properties.corpse_exist, false));

    actionMeetWait.add_precondition(new world_property(properties.contact, true));
    actionMeetWait.add_precondition(new world_property(properties.wounded, false));
    actionMeetWait.add_precondition(new world_property(properties.abuse, false));
    actionMeetWait.add_effect(new world_property(properties.contact, false));
    actionPlanner.add_action(operators.contact, actionMeetWait);

    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.contact, false));

    actionPlanner
      .action(operators.state_mgr_to_idle_alife)
      .add_precondition(new world_property(properties.contact, false));

    state.meet_manager = new ActionSchemeMeet(object, state);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, state, state.meet_manager);
  }

  public static set_meet(npc: XR_game_object, ini: XR_ini_file, scheme: TScheme, section: TSection): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);
  }

  public static reset_meet(npc: XR_game_object, scheme: TScheme, st: IStoredObject, section: TSection): void {
    const meet_section: TSection =
      scheme === null || scheme === "nil"
        ? getConfigString(st.ini!, st.section_logic!, ActionSchemeMeet.SCHEME_SECTION, npc, false, "")
        : getConfigString(st.ini!, section, ActionSchemeMeet.SCHEME_SECTION, npc, false, "");

    ActionSchemeMeet.init_meet(npc, st.ini!, meet_section, st.meet, scheme);
  }

  public static init_meet(
    npc: XR_game_object,
    ini: XR_ini_file,
    section: TSection,
    st: IStoredObject,
    scheme: TScheme
  ): void {
    if (tostring(section) === st.meet_section && tostring(section) !== "nil") {
      return;
    }

    st.meet_section = tostring(section);

    /**
     *   // -- [[
     *   [meet]
     *   close_distance    = {=actor_has_weapon} 3, 3
     *   close_anim        = {=actor_has_weapon} a, b
     *   close_snd_hello = {=actor_has_weapon} a, b
     *   close_snd_bye    = {=actor_has_weapon} a, b
     *   close_victim    = {=actor_has_weapon} a, b
     *
     *
     *   far_distance    = {=actor_has_weapon} 30, 30
     *   far_anim        = {=actor_has_weapon} a, b
     *   far_snd        = {=actor_has_weapon} a, b
     *   far_victim        = {=actor_has_weapon} a, b
     *
     *
     *   snd_on_use        = {=in_battle} a, {=no_talk} b, c
     *
     *   use                = {=actor_has_weapon} true, false  // --  this - ����� ���
     *   meet_dialog        = {=actor_has_weapon} a
     *   abuse            = {=in_battle} true, false
     *   trade_enable    = {=in_battle} true, false
     *   allow_break        = {=in_battle} true, false
     *
     *   ��������������� ���������:
     *
     *   reset_distance    = 30
     *   ]]
     */

    const def: AnyObject = {};

    const relation = get_npcs_relation(npc, getActor());

    if (relation === game_object.enemy) {
      def.close_distance = "0";
      def.close_anim = "nil";
      def.close_snd_distance = "0";
      def.close_snd_hello = "nil";
      def.close_snd_bye = "nil";
      def.close_victim = "nil";
      def.far_distance = "0";
      def.far_anim = "nil";
      def.far_snd_distance = "0";
      def.far_snd = "nil";
      def.far_victim = "nil";
      def.snd_on_use = "nil";
      def.use = "false";
      def.meet_dialog = "nil";
      def.abuse = "false";
      def.trade_enable = "true";
      def.allow_break = "true";
      def.meet_on_talking = "false";
      def.use_text = "nil";
    } else {
      def.close_distance = "{=is_wounded} 0, {!is_squad_commander} 0, 3";
      def.close_anim = "{=is_wounded} nil, {!is_squad_commander} nil, {=actor_has_weapon} threat_na, talk_default";
      def.close_snd_distance = "{=is_wounded} 0, {!is_squad_commander} 0, 3";
      def.close_snd_hello =
        "{=is_wounded} nil, {!is_squad_commander} nil, {=actor_enemy} nil," +
        " {=actor_has_weapon} meet_hide_weapon, meet_hello";
      def.close_snd_bye =
        "{=is_wounded} nil, {!is_squad_commander} nil, {=actor_enemy} nil, {=actor_has_weapon} nil, meet_hello";
      def.close_victim = "{=is_wounded} nil, {!is_squad_commander} nil, actor";
      def.far_distance = "{=is_wounded} 0, {!is_squad_commander} 0, 5";
      def.far_anim = "nil";
      def.far_snd_distance = "{=is_wounded} 0, {!is_squad_commander} 0, 5";
      def.far_snd = "nil";
      def.far_victim = "nil";
      def.snd_on_use =
        "{=is_wounded} nil, {!is_squad_commander} meet_use_no_talk_leader, {=actor_enemy} nil," +
        " {=has_enemy} meet_use_no_fight, {=actor_has_weapon} meet_use_no_weapon, {!dist_to_actor_le(3)} v";
      def.use =
        "{=is_wounded} false, {!is_squad_commander} false, {=actor_enemy} false, {=has_enemy} false," +
        " {=actor_has_weapon} false, {=dist_to_actor_le(3)} true, false";
      def.meet_dialog = "nil";
      def.abuse = "{=has_enemy} false, true";
      def.trade_enable = "true";
      def.allow_break = "true";
      def.meet_on_talking = "true";
      def.use_text = "nil";
    }

    if (tostring(section) === "no_meet)") {
      st.close_distance = parseCondList(npc, section, "close_distance", "0");
      st.close_anim = parseCondList(npc, section, "close_anim", "nil");
      st.close_snd_distance = parseCondList(npc, section, "close_distance", "0");
      st.close_snd_hello = parseCondList(npc, section, "close_snd_hello", "nil");
      st.close_snd_bye = parseCondList(npc, section, "close_snd_bye", "nil");
      st.close_victim = parseCondList(npc, section, "close_victim", "nil");

      st.far_distance = parseCondList(npc, section, "far_distance", "0");
      st.far_anim = parseCondList(npc, section, "far_anim", "nil");
      st.far_snd_distance = parseCondList(npc, section, "far_distance", "0");
      st.far_snd = parseCondList(npc, section, "far_snd", "nil");
      st.far_victim = parseCondList(npc, section, "far_victim", "nil");

      st.snd_on_use = parseCondList(npc, section, "snd_on_use", "nil");
      st.use = parseCondList(npc, section, "use", "false");
      st.meet_dialog = parseCondList(npc, section, "meet_dialog", "nil");
      st.abuse = parseCondList(npc, section, "abuse", "false");
      st.trade_enable = parseCondList(npc, section, "trade_enable", "true");
      st.allow_break = parseCondList(npc, section, "allow_break", "true");
      st.meet_on_talking = parseCondList(npc, section, "meet_on_talking", "false");
      st.use_text = parseCondList(npc, section, "use_text", "nil");

      st.reset_distance = 30;
      st.meet_only_at_path = true;
    } else {
      st.close_distance = parseCondList(
        npc,
        section,
        "close_distance",
        getConfigString(ini, section, "close_distance", npc, false, "", def.close_distance)
      );
      st.close_anim = parseCondList(
        npc,
        section,
        "close_anim",
        getConfigString(ini, section, "close_anim", npc, false, "", def.close_anim)
      );
      st.close_snd_distance = parseCondList(
        npc,
        section,
        "close_snd_distance",
        getConfigString(ini, section, "close_snd_distance", npc, false, "", def.close_distance)
      );
      st.close_snd_hello = parseCondList(
        npc,
        section,
        "close_snd_hello",
        getConfigString(ini, section, "close_snd_hello", npc, false, "", def.close_snd_hello)
      );
      st.close_snd_bye = parseCondList(
        npc,
        section,
        "close_snd_bye",
        getConfigString(ini, section, "close_snd_bye", npc, false, "", def.close_snd_bye)
      );
      st.close_victim = parseCondList(
        npc,
        section,
        "close_victim",
        getConfigString(ini, section, "close_victim", npc, false, "", def.close_victim)
      );

      st.far_distance = parseCondList(
        npc,
        section,
        "far_distance",
        getConfigString(ini, section, "far_distance", npc, false, "", def.far_distance)
      );
      st.far_anim = parseCondList(
        npc,
        section,
        "far_anim",
        getConfigString(ini, section, "far_anim", npc, false, "", def.far_anim)
      );
      st.far_snd_distance = parseCondList(
        npc,
        section,
        "far_snd_distance",
        getConfigString(ini, section, "far_snd_distance", npc, false, "", def.far_snd_distance)
      );
      st.far_snd = parseCondList(
        npc,
        section,
        "far_snd",
        getConfigString(ini, section, "far_snd", npc, false, "", def.far_snd)
      );
      st.far_victim = parseCondList(
        npc,
        section,
        "far_victim",
        getConfigString(ini, section, "far_victim", npc, false, "", def.far_victim)
      );

      st.snd_on_use = parseCondList(
        npc,
        section,
        "snd_on_use",
        getConfigString(ini, section, "snd_on_use", npc, false, "", def.snd_on_use)
      );
      st.use = parseCondList(npc, section, "use", getConfigString(ini, section, "use", npc, false, "", def.use));
      st.meet_dialog = parseCondList(
        npc,
        section,
        "meet_dialog",
        getConfigString(ini, section, "meet_dialog", npc, false, "", def.meet_dialog)
      );
      st.abuse = parseCondList(
        npc,
        section,
        "abuse",
        getConfigString(ini, section, "abuse", npc, false, "", def.abuse)
      );
      st.trade_enable = parseCondList(
        npc,
        section,
        "trade_enable",
        getConfigString(ini, section, "trade_enable", npc, false, "", def.trade_enable)
      );
      st.allow_break = parseCondList(
        npc,
        section,
        "allow_break",
        getConfigString(ini, section, "allow_break", npc, false, "", def.allow_break)
      );
      st.meet_on_talking = parseCondList(
        npc,
        section,
        "meet_on_talking",
        getConfigString(ini, section, "meet_on_talking", npc, false, "", def.meet_on_talking)
      );
      st.use_text = parseCondList(
        npc,
        section,
        "use_text",
        getConfigString(ini, section, "use_text", npc, false, "", def.use_text)
      );

      st.reset_distance = 30;
      st.meet_only_at_path = true;
    }

    st.meet_manager.set_start_distance();
    st.meet_set = true;
  }

  public static disable_scheme(npc: XR_game_object, scheme: TScheme): void {
    storage.get(npc.id()).actor_dialogs = null;
    storage.get(npc.id()).actor_disable = null;
  }

  public static process_npc_usability(npc: XR_game_object): void {
    if (isObjectWounded(npc)) {
      if (npc.relation(getActor()!) === game_object.enemy) {
        npc.disable_talk();
      } else {
        const wounded = storage.get(npc.id()).wounded!;

        if (wounded.enable_talk) {
          npc.enable_talk();
        } else {
          npc.disable_talk();
        }
      }

      return;
    }

    const meet = storage.get(npc.id()).meet;
    const use = meet.meet_manager.use;

    if (use === "true") {
      if (ActionCorpseDetect.is_under_corpse_detection(npc) || ActionSchemeHelpWounded.is_under_help_wounded(npc)) {
        npc.disable_talk();
      } else {
        npc.enable_talk();
      }
    } else if (use === "false") {
      npc.disable_talk();
      if (npc.is_talking()) {
        npc.stop_talk();
      }
    }
  }

  public static notify_on_use(victim: XR_game_object, who: XR_game_object): void {
    if (!victim.alive()) {
      return;
    }

    const st = storage.get(victim.id()).meet;

    if (st === null) {
      return;
    }

    const actor = getActor();
    const snd = pickSectionFromCondList(actor, victim, st.snd_on_use);

    if (tostring(snd) !== "nil") {
      GlobalSound.set_sound_play(victim.id(), snd, null, null);
    }

    const meet_manager = st.meet_manager;

    if (
      meet_manager.use === "false" &&
      meet_manager.abuse_mode === "true" &&
      get_npcs_relation(victim, getActor()) === game_object.friend
    ) {
      AbuseManager.add_abuse(victim, 1);
    }
  }

  public startdialog: Optional<string> = null;
  public abuse_mode: Optional<string> = null;
  public trade_enable: Optional<boolean> = null;
  public use: Optional<string> = null;
  public allow_break: Optional<boolean> = null;
  public npc_is_camp_director: boolean = false;
  public hello_passed: boolean = false;
  public bye_passed: boolean = false;
  public current_distance: Optional<string> = null;

  public update_state(): void {
    const actor: Optional<XR_game_object> = getActor();
    let state: Optional<string> = null;
    let victim = null;

    if (this.current_distance === "close") {
      state = pickSectionFromCondList(actor, this.object, this.state.close_anim);
      victim = pickSectionFromCondList(actor, this.object, this.state.close_victim);
    } else if (this.current_distance === "far") {
      state = pickSectionFromCondList(actor, this.object, this.state.far_anim);
      victim = pickSectionFromCondList(actor, this.object, this.state.far_victim);
    }

    if (tostring(victim) === "nil") {
      victim = null;
    } else {
      if (alife() !== null) {
        victim = getStoryObject(victim!);
      }
    }

    if (tostring(state) !== "nil") {
      if (victim === null) {
        set_state(this.object, state!, null, null, null, null);
      } else {
        set_state(this.object, state!, null, null, { look_object: victim }, null);
      }
    }

    const snd = pickSectionFromCondList(actor, this.object, this.state.far_snd);

    if (tostring(snd) !== "nil") {
      GlobalSound.set_sound_play(this.object.id(), snd, null, null);
    }
  }

  public set_start_distance(): void {
    const actor: Optional<XR_game_object> = getActor();

    if (actor === null) {
      this.hello_passed = false;
      this.bye_passed = false;
      this.current_distance = null;

      return;
    }

    if (!this.object.alive()) {
      this.hello_passed = false;
      this.bye_passed = false;
      this.current_distance = null;

      return;
    }

    const distance = this.object.position().distance_to(actor.position());
    const actor_visible = this.object.see(actor);

    const is_object_far =
      actor_visible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_distance))!;
    const is_object_close =
      (actor_visible &&
        distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.close_distance))!) ||
      this.object.is_talking();

    if (is_object_close === true) {
      this.hello_passed = true;
      this.current_distance = "close";
    } else if (is_object_far === true) {
      this.bye_passed = true;
      this.current_distance = "far";
    } else if (distance > this.state.reset_distance) {
      this.hello_passed = false;
      this.bye_passed = false;
      this.current_distance = null;
    } else {
      this.current_distance = null;
    }
  }

  public update(): void {
    const actor = getActor()!;
    const distance = this.object.position().distance_to(actor.position());
    const actor_visible = this.object.see(actor);

    if (actor_visible) {
      if (distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.close_snd_distance))!) {
        if (this.hello_passed === false) {
          const snd = pickSectionFromCondList(actor, this.object, this.state.close_snd_hello);

          if (tostring(snd) !== "nil" && !is_npc_in_combat(this.object)) {
            GlobalSound.set_sound_play(this.object.id(), snd, null, null);
          }

          this.hello_passed = true;
        }
      } else if (distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_snd_distance))!) {
        if (this.hello_passed === true) {
          if (this.bye_passed === false) {
            const snd = pickSectionFromCondList(actor, this.object, this.state.close_snd_bye);

            if (tostring(snd) !== "nil" && !is_npc_in_combat(this.object)) {
              GlobalSound.set_sound_play(this.object.id(), snd, null, null);
            }

            this.bye_passed = true;
          }
        }
      }
    }

    const is_object_far =
      actor_visible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_distance))!;
    const is_object_close =
      (actor_visible &&
        distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.close_distance))!) ||
      (this.object.is_talking() && this.state.meet_on_talking);

    if (is_object_close === true) {
      if (this.current_distance !== "close") {
        this.current_distance = "close";
      }
    } else if (is_object_far === true) {
      this.current_distance = "far";
    } else if (distance > this.state.reset_distance) {
      this.hello_passed = false;
      this.bye_passed = false;
      this.current_distance = null;
    } else {
      this.current_distance = null;
    }

    const allow_break = pickSectionFromCondList(actor, this.object, this.state.allow_break);

    if (this.allow_break !== (allow_break === "true")) {
      this.allow_break = allow_break === "true";
    }

    if (this.state.meet_dialog !== null) {
      const start_dialog = pickSectionFromCondList(actor, this.object, this.state.meet_dialog);

      if (this.startdialog !== start_dialog) {
        this.startdialog = start_dialog;
        if (start_dialog === null || start_dialog === "nil") {
          this.object.restore_default_start_dialog();
        } else {
          this.object.set_start_dialog(start_dialog);
          if (this.object.is_talking()) {
            actor.run_talk_dialog(this.object, !this.allow_break);
          }
        }
      }
    }

    const is_talking = this.object.is_talking();
    let use = pickSectionFromCondList(actor, this.object, this.state.use);

    if (this.npc_is_camp_director === true) {
      use = "false";
    }

    if (this.use !== use) {
      if (use === "self") {
        if (!is_talking && device().precache_frame < 1) {
          this.object.enable_talk();
          this.object.allow_break_talk_dialog(this.allow_break);
          actor.run_talk_dialog(this.object, !this.allow_break);
        }
      }

      if (device().precache_frame < 1) {
        this.use = use;
      }
    }

    const use_text = pickSectionFromCondList(actor, this.object, this.state.use_text)!;

    if (use_text !== "nil") {
      this.object.set_tip_text(use_text);
    } else {
      if (this.object.is_talk_enabled()) {
        this.object.set_tip_text("character_use");
      } else {
        this.object.set_tip_text("");
      }
    }

    this.object.allow_break_talk_dialog(this.allow_break);

    /**
     *   // -- [[
     *     if (is_talking {
     *       db.actor:allow_break_talk_dialog(this.allow_break)
     *     }
     *   ]]
     */

    const abuse = pickSectionFromCondList(actor, this.object, this.state.abuse);

    if (this.abuse_mode !== abuse) {
      if (abuse === "true") {
        AbuseManager.enable_abuse(this.object);
      } else {
        AbuseManager.disable_abuse(this.object);
      }

      this.abuse_mode = abuse;
    }
  }
}
