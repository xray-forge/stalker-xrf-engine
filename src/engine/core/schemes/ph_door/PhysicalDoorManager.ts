import { CPhysicObject, game_object, physics_element, physics_joint, physics_shell, vector } from "xray16";

import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemePhysicalDoorState } from "@/engine/core/schemes/ph_door/ISchemePhysicalDoorState";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { Optional, TCount, TIndex } from "@/engine/lib/types";

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
  public joint: Optional<physics_joint> = null;

  public low_limits: number = 0;
  public hi_limits: number = 0;

  /**
   * todo: Description.
   */
  public override resetScheme(loading?: boolean): void {
    this.state.signals = new LuaTable();

    this.initialized = false;

    const ph_shell: Optional<physics_shell> = this.object.get_physics_shell();

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
   * todo: Description.
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
   * todo: Description.
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
   * todo: Description.
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
   * todo: Description.
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
      GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.snd_close_stop, null, null);
    }
  }

  /**
   * todo: Description.
   */
  public open_door(disableSound?: boolean): void {
    if (!disableSound) {
      if (this.state.snd_open_start) {
        GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.snd_open_start, null, null);
      }
    }

    this.object.set_fastcall(this.open_fastcall, this);

    const physicsShell: Optional<physics_shell> = this.object.get_physics_shell();

    if (physicsShell) {
      const physicsElement: physics_element = physicsShell.get_element_by_bone_name("door");

      if (physicsElement.is_fixed()) {
        physicsElement.release_fixed();

        const physicsObject: CPhysicObject = this.object.get_physics_object();

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
   * todo: Description.
   */
  public is_closed(): boolean {
    const angle = this.state.slider ? -this.joint!.get_axis_angle(0) : this.joint!.get_axis_angle(90);

    return angle <= this.low_limits + 0.02;
  }

  /**
   * todo: Description.
   */
  public is_open(): boolean {
    const angle = this.state.slider ? -this.joint!.get_axis_angle(0) : this.joint!.get_axis_angle(90);

    return angle >= this.hi_limits - 0.02;
  }

  /**
   * todo: Description.
   */
  public close_door(disable_snd: boolean): void {
    if (!disable_snd) {
      if (this.state.snd_close_start !== null) {
        GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.snd_close_start, null, null);
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
   * todo: Description.
   */
  public try_switch(): boolean {
    if (this.state.on_use) {
      if (
        switchObjectSchemeToSection(
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
   * todo: Description.
   */
  public use_callback(target: game_object, who: Optional<game_object>): void {
    if (this.state.locked) {
      if (this.state.snd_open_start) {
        GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.snd_open_start, null, null);
      }
    }

    this.try_switch();
  }

  /**
   * todo: Description.
   */
  public hit_callback(
    object: game_object,
    amount: TCount,
    const_direction: vector,
    who: Optional<game_object>,
    boneIndex: TIndex
  ): void {
    if (this.state.hit_on_bone.has(boneIndex)) {
      const section = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.hit_on_bone.get(boneIndex).state!
      );

      switchObjectSchemeToSection(object, this.state.ini!, section!);

      return;
    }
  }

  /**
   * todo: Description.
   */
  public override deactivate(): void {
    this.object.set_tip_text("");
  }
}
