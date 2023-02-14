import { abort } from "scripts/utils/debug";
import { XR_game_object, XR_ini_file, XR_physics_joint, XR_physics_shell, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigCondList,
  getConfigString,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";

export class ActionDoor extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.PH_DOOR;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    object.register_door_for_npc();

    subscribeActionForEvents(object, state, new ActionDoor(object, state));
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
    state.closed = getConfigBoolean(ini, section, "closed", object, false, true);
    state.locked = getConfigBoolean(ini, section, "locked", object, false);
    state.no_force = getConfigBoolean(ini, section, "no_force", object, false, false);
    state.not_for_npc = getConfigBoolean(ini, section, "not_for_npc", object, false, false);
    state.show_tips = getConfigBoolean(ini, section, "show_tips", object, false, true);
    state.tip_open = getConfigString(ini, section, "tip_open", object, false, "", "tip_door_open");
    state.tip_unlock = getConfigString(ini, section, "tip_open", object, false, "", "tip_door_locked");
    state.tip_close = getConfigString(ini, section, "tip_close", object, false, "", "tip_door_close");
    state.slider = getConfigBoolean(ini, section, "slider", object, false, false);
    // --    st.snd_init        = getConfigString(ini, section, "snd_init", npc, false, "")
    state.snd_open_start = getConfigString(ini, section, "snd_open_start", object, false, "", "trader_door_open_start");
    state.snd_close_start = getConfigString(
      ini,
      section,
      "snd_close_start",
      object,
      false,
      "",
      "trader_door_close_start"
    );
    state.snd_close_stop = getConfigString(ini, section, "snd_close_stop", object, false, "", "trader_door_close_stop");
    state.on_use = getConfigCondList(ini, section, "on_use", object);

    if (state.locked === true || state.not_for_npc === true) {
      if (!object.is_door_locked_for_npc()) {
        object.lock_door_for_npc();
      }
    } else {
      if (object.is_door_locked_for_npc()) {
        object.unlock_door_for_npc();
      }
    }

    state.hit_on_bone = get_global<AnyCallablesModule>("utils").parse_data_1v(
      object,
      getConfigString(ini, section, "hit_on_bone", object, false, "")
    );
  }

  public snd_obj: Optional<unknown> = null;
  public door_action: Optional<ActionDoor> = this;
  public initialized: Optional<boolean> = null;
  public block: boolean = false;
  public soundless_block: boolean = false;
  public show_tips: boolean = false;
  public joint: Optional<XR_physics_joint> = null;

  public low_limits: number = 0;
  public hi_limits: number = 0;

  public reset_scheme(loading?: boolean): void {
    this.state.signals = {};

    this.initialized = false;

    const ph_shell: Optional<XR_physics_shell> = this.object.get_physics_shell();

    if (!ph_shell) {
      return;
    }

    this.joint = ph_shell.get_joint_by_bone_name("door");

    [this.low_limits, this.hi_limits] = this.joint.get_limits(this.low_limits, this.hi_limits, 0);

    this.block = false;
    this.soundless_block = false;

    this.show_tips = this.state.show_tips;

    let disable_snd: boolean = false;

    if (!this.state.script_used_more_than_once) {
      disable_snd = true;
      this.state.script_used_more_than_once = true;
    }

    if (this.state.closed) {
      if (this.is_closed()) {
        disable_snd = true;
      }

      this.close_door(disable_snd);
    } else {
      this.open_door(disable_snd);
    }

    this.object.set_nonscript_usable(false);

    this.initialized = true;
  }

  public update(delta: number): void {
    // --printf("_bp: action_door:update()", delta)
    if (!this.initialized) {
      abort("object '%s': door failed to initialize", this.object.name());
    }

    if (trySwitchToAnotherSection(this.object, this.state, getActor())) {
      return;
    }
  }

  public fastcall(): boolean {
    if (!this.initialized) {
      return false;
    }

    if (this.block && this.is_closed()) {
      this.close_action();
      this.object.on_door_is_closed();

      return true;
    }

    return false;
  }

  public open_fastcall(): boolean {
    if (!this.initialized) {
      return false;
    }

    if (this.is_open()) {
      this.object.get_physics_object().unset_door_ignore_dynamics();
      this.object.on_door_is_open();

      return true;
    }

    return false;
  }

  public close_action(): void {
    if (this.state.no_force === true) {
      this.joint!.set_max_force_and_velocity(0, 0, 0);
    } else {
      this.joint!.set_max_force_and_velocity(10000, 1, 0);

      const ph_shell = this.object.get_physics_shell();

      if (ph_shell) {
        const ph_element = ph_shell.get_element_by_bone_name("door");

        if (!ph_element.is_fixed()) {
          ph_element.fix();
        }
      }
    }

    this.object.get_physics_object().unset_door_ignore_dynamics();
    this.block = false;

    if (!this.soundless_block && this.state.snd_close_stop) {
      GlobalSound.set_sound_play(this.object.id(), this.state.snd_close_stop, null, null);
    }
  }

  public open_door(disable_snd?: boolean): void {
    if (!disable_snd) {
      if (this.state.snd_open_start) {
        GlobalSound.set_sound_play(this.object.id(), this.state.snd_open_start, null, null);
      }
    }

    this.object.set_fastcall(this.open_fastcall, this);

    const ph_shell: Optional<XR_physics_shell> = this.object.get_physics_shell();

    if (ph_shell) {
      const ph_element = ph_shell.get_element_by_bone_name("door");

      if (ph_element.is_fixed()) {
        ph_element.release_fixed();

        const ph_obj = this.object.get_physics_object();

        ph_obj.set_door_ignore_dynamics();
      }
    }

    if (this.state.no_force === true) {
      this.joint!.set_max_force_and_velocity(0, 0, 0);
    } else {
      this.joint!.set_max_force_and_velocity(2100, -3, 0);
    }

    this.block = false;

    if (this.show_tips && this.state.tip_close) {
      this.object.set_tip_text(this.state.tip_close);
    }
  }

  public is_closed(): boolean {
    const angle = this.state.slider ? -this.joint!.get_axis_angle(0) : this.joint!.get_axis_angle(90);

    return angle <= this.low_limits + 0.02;
  }

  public is_open(): boolean {
    const angle = this.state.slider ? -this.joint!.get_axis_angle(0) : this.joint!.get_axis_angle(90);

    return angle >= this.hi_limits - 0.02;
  }

  public close_door(disable_snd: boolean): void {
    if (!disable_snd) {
      if (this.state.snd_close_start) {
        GlobalSound.set_sound_play(this.object.id(), this.state.snd_close_start, null, null);
      }
    }

    this.object.set_fastcall(this.fastcall, this);

    if (this.state.no_force === true) {
      this.joint!.set_max_force_and_velocity(0, 0, 0);
    } else {
      this.joint!.set_max_force_and_velocity(200, 3, 0);
    }

    this.block = true;
    this.soundless_block = disable_snd;

    const ph_obj = this.object.get_physics_object();

    ph_obj.set_door_ignore_dynamics();

    if (this.show_tips) {
      if (this.state.locked === true && this.state.tip_unlock) {
        this.object.set_tip_text(this.state.tip_unlock);

        return;
      }

      if (this.state.tip_open) {
        this.object.set_tip_text(this.state.tip_open);
      }
    }
  }

  public try_switch(): boolean {
    if (this.state.on_use) {
      if (
        switchToSection(
          this.object,
          this.state.ini!,
          pickSectionFromCondList(getActor(), this.object, this.state.on_use.condlist)!
        )
      ) {
        return true;
      }
    }

    return false;
  }

  public use_callback(target: XR_game_object, who: Optional<XR_game_object>): void {
    if (this.state.locked) {
      if (this.state.snd_open_start) {
        GlobalSound.set_sound_play(this.object.id(), this.state.snd_open_start, null, null);
      }
    }

    this.try_switch();
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    if (this.state.hit_on_bone[bone_index] !== null) {
      const section = pickSectionFromCondList(getActor(), this.object, this.state.hit_on_bone[bone_index].state);

      switchToSection(object, this.state.ini!, section!);

      return;
    }
  }

  public deactivate(): void {
    this.object.set_tip_text("");
  }
}
