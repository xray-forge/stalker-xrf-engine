import {
  XR_CPhysicObject,
  XR_game_object,
  XR_physics_element,
  XR_physics_joint,
  XR_physics_shell,
  XR_vector,
} from "xray16";

import { Optional, TCount, TIndex } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalDoorState } from "@/mod/scripts/core/schemes/ph_door/ISchemePhysicalDoorState";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { pickSectionFromCondList } from "@/mod/scripts/utils/config";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * todo;
 */
export class PhysicalDoorManager extends AbstractSchemeManager<ISchemePhysicalDoorState> {
  public snd_obj: Optional<unknown> = null;
  public door_action: Optional<PhysicalDoorManager> = this;
  public initialized: Optional<boolean> = null;
  public block: boolean = false;
  public soundless_block: boolean = false;
  public show_tips: boolean = false;
  public joint: Optional<XR_physics_joint> = null;

  public low_limits: number = 0;
  public hi_limits: number = 0;

  /**
   * todo;
   */
  public override resetScheme(loading?: boolean): void {
    this.state.signals = new LuaTable();

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

  /**
   * todo;
   */
  public override update(): void {
    // --printf("_bp: action_door:update()", delta)
    if (!this.initialized) {
      abort("object '%s': door failed to initialize", this.object.name());
    }

    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
      return;
    }
  }

  /**
   * todo;
   */
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

  /**
   * todo;
   */
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

  /**
   * todo;
   */
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
      GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), this.state.snd_close_stop, null, null);
    }
  }

  /**
   * todo;
   */
  public open_door(disableSound?: boolean): void {
    if (!disableSound) {
      if (this.state.snd_open_start) {
        GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), this.state.snd_open_start, null, null);
      }
    }

    this.object.set_fastcall(this.open_fastcall, this);

    const physicsShell: Optional<XR_physics_shell> = this.object.get_physics_shell();

    if (physicsShell) {
      const physicsElement: XR_physics_element = physicsShell.get_element_by_bone_name("door");

      if (physicsElement.is_fixed()) {
        physicsElement.release_fixed();

        const physicsObject: XR_CPhysicObject = this.object.get_physics_object();

        physicsObject.set_door_ignore_dynamics();
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

  /**
   * todo;
   */
  public is_closed(): boolean {
    const angle = this.state.slider ? -this.joint!.get_axis_angle(0) : this.joint!.get_axis_angle(90);

    return angle <= this.low_limits + 0.02;
  }

  /**
   * todo;
   */
  public is_open(): boolean {
    const angle = this.state.slider ? -this.joint!.get_axis_angle(0) : this.joint!.get_axis_angle(90);

    return angle >= this.hi_limits - 0.02;
  }

  /**
   * todo;
   */
  public close_door(disable_snd: boolean): void {
    if (!disable_snd) {
      if (this.state.snd_close_start !== null) {
        GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), this.state.snd_close_start, null, null);
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

  /**
   * todo;
   */
  public try_switch(): boolean {
    if (this.state.on_use) {
      if (
        switchToSection(
          this.object,
          this.state.ini!,
          pickSectionFromCondList(registry.actor, this.object, this.state.on_use.condlist)!
        )
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * todo;
   */
  public use_callback(target: XR_game_object, who: Optional<XR_game_object>): void {
    if (this.state.locked) {
      if (this.state.snd_open_start) {
        GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), this.state.snd_open_start, null, null);
      }
    }

    this.try_switch();
  }

  /**
   * todo;
   */
  public hit_callback(
    object: XR_game_object,
    amount: TCount,
    const_direction: XR_vector,
    who: Optional<XR_game_object>,
    boneIndex: TIndex
  ): void {
    if (this.state.hit_on_bone.has(boneIndex)) {
      const section = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.hit_on_bone.get(boneIndex).state!
      );

      switchToSection(object, this.state.ini!, section!);

      return;
    }
  }

  /**
   * todo;
   */
  public override deactivate(): void {
    this.object.set_tip_text("");
  }
}
