import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemePhysicalDoorState } from "@/engine/core/schemes/ph_door/ISchemePhysicalDoorState";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import {
  ClientObject,
  Optional,
  PhysicObject,
  PhysicsElement,
  PhysicsJoint,
  PhysicsShell,
  TCount,
  TIndex,
  TRate,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
export class PhysicalDoorManager extends AbstractSchemeManager<ISchemePhysicalDoorState> {
  public isInitialized: Optional<boolean> = null;
  public block: boolean = false;
  public soundlessBlock: boolean = false;
  public showTips: boolean = false;
  public joint: Optional<PhysicsJoint> = null;

  public lowLimits: number = 0;
  public hiLimits: number = 0;

  /**
   * todo: Description.
   */
  public override resetScheme(loading?: boolean): void {
    this.state.signals = new LuaTable();

    this.isInitialized = false;

    const physicsShell: Optional<PhysicsShell> = this.object.get_physics_shell();

    if (!physicsShell) {
      return;
    }

    this.joint = physicsShell.get_joint_by_bone_name("door");

    [this.lowLimits, this.hiLimits] = this.joint.get_limits(this.lowLimits, this.hiLimits, 0);

    this.block = false;
    this.soundlessBlock = false;

    this.showTips = this.state.show_tips;

    let isSoundDisabled: boolean = false;

    if (!this.state.script_used_more_than_once) {
      isSoundDisabled = true;
      this.state.script_used_more_than_once = true;
    }

    if (this.state.closed) {
      if (this.isClosed()) {
        isSoundDisabled = true;
      }

      this.closeDoor(isSoundDisabled);
    } else {
      this.openDoor(isSoundDisabled);
    }

    this.object.set_nonscript_usable(false);

    this.isInitialized = true;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    if (!this.isInitialized) {
      abort("object '%s': door failed to initialize", this.object.name());
    }

    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }
  }

  /**
   * todo: Description.
   */
  public fastcall(): boolean {
    if (!this.isInitialized) {
      return false;
    }

    if (this.block && this.isClosed()) {
      this.closeAction();
      this.object.on_door_is_closed();

      return true;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public openFastcall(): boolean {
    if (!this.isInitialized) {
      return false;
    }

    if (this.isOpen()) {
      this.object.get_physics_object().unset_door_ignore_dynamics();
      this.object.on_door_is_open();

      return true;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public closeAction(): void {
    if (this.state.no_force === true) {
      this.joint!.set_max_force_and_velocity(0, 0, 0);
    } else {
      this.joint!.set_max_force_and_velocity(10000, 1, 0);

      const physicsShell: Optional<PhysicsShell> = this.object.get_physics_shell();

      if (physicsShell) {
        const physicsElement: PhysicsElement = physicsShell.get_element_by_bone_name("door");

        if (!physicsElement.is_fixed()) {
          physicsElement.fix();
        }
      }
    }

    this.object.get_physics_object().unset_door_ignore_dynamics();
    this.block = false;

    if (!this.soundlessBlock && this.state.snd_close_stop) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.snd_close_stop, null, null);
    }
  }

  /**
   * todo: Description.
   */
  public openDoor(disableSound?: boolean): void {
    if (!disableSound) {
      if (this.state.snd_open_start) {
        GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.snd_open_start, null, null);
      }
    }

    this.object.set_fastcall(this.openFastcall, this);

    const physicsShell: Optional<PhysicsShell> = this.object.get_physics_shell();

    if (physicsShell) {
      const physicsElement: PhysicsElement = physicsShell.get_element_by_bone_name("door");

      if (physicsElement.is_fixed()) {
        physicsElement.release_fixed();

        const physicsObject: PhysicObject = this.object.get_physics_object();

        physicsObject.set_door_ignore_dynamics();
      }
    }

    if (this.state.no_force === true) {
      this.joint!.set_max_force_and_velocity(0, 0, 0);
    } else {
      this.joint!.set_max_force_and_velocity(2100, -3, 0);
    }

    this.block = false;

    if (this.showTips && this.state.tip_close) {
      this.object.set_tip_text(this.state.tip_close);
    }
  }

  /**
   * todo: Description.
   */
  public isClosed(): boolean {
    const angle: TRate = this.state.slider ? -this.joint!.get_axis_angle(0) : this.joint!.get_axis_angle(90);

    return angle <= this.lowLimits + 0.02;
  }

  /**
   * todo: Description.
   */
  public isOpen(): boolean {
    const angle: TRate = this.state.slider ? -this.joint!.get_axis_angle(0) : this.joint!.get_axis_angle(90);

    return angle >= this.hiLimits - 0.02;
  }

  /**
   * todo: Description.
   */
  public closeDoor(disableSound: boolean): void {
    if (!disableSound) {
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
    this.soundlessBlock = disableSound;

    const physicObject: PhysicObject = this.object.get_physics_object();

    physicObject.set_door_ignore_dynamics();

    if (this.showTips) {
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
  public trySwitch(): boolean {
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
  public override onUse(target: ClientObject, who: Optional<ClientObject>): void {
    if (this.state.locked) {
      if (this.state.snd_open_start) {
        GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.snd_open_start, null, null);
      }
    }

    this.trySwitch();
  }

  /**
   * todo: Description.
   */
  public override onHit(
    object: ClientObject,
    amount: TCount,
    direction: Vector,
    who: Optional<ClientObject>,
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
