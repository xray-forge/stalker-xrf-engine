import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { getManager, registry } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ISchemePhysicalDoorState } from "@/engine/core/schemes/physical/ph_door/ph_door_types";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import {
  GameObject,
  Optional,
  PhysicObject,
  PhysicsElement,
  PhysicsJoint,
  PhysicsShell,
  TCount,
  TIndex,
  TRate,
  TSection,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class PhysicalDoorManager extends AbstractSchemeManager<ISchemePhysicalDoorState> {
  public isInitialized: boolean = false;
  public block: boolean = false;
  public soundlessBlock: boolean = false;
  public showTips: boolean = false;
  public joint: Optional<PhysicsJoint> = null;

  public lowLimits: number = 0;
  public hiLimits: number = 0;

  public override activate(): void {
    logger.info("Activate door: %s %s", this.object.name(), this.state.section);

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

    this.showTips = this.state.showTips;

    let isSoundDisabled: boolean = false;

    if (!this.state.scriptUsedMoreThanOnce) {
      isSoundDisabled = true;
      this.state.scriptUsedMoreThanOnce = true;
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

  public override deactivate(): void {
    logger.info("Deactivate door: %s %s", this.object.name(), this.state.section);

    this.object.set_tip_text("");
  }

  public update(): void {
    if (!this.isInitialized) {
      abort("Object '%s' door was not initialized.", this.object.name());
    }

    trySwitchToAnotherSection(this.object, this.state);
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
    if (this.state.noForce === true) {
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

    if (!this.soundlessBlock && this.state.sndCloseStop) {
      getManager(SoundManager).play(this.object.id(), this.state.sndCloseStop);
    }
  }

  /**
   * todo: Description.
   */
  public openDoor(disableSound?: boolean): void {
    logger.info("Open door: %s %s", this.object.name(), this.state.section);

    if (!disableSound) {
      if (this.state.sndOpenStart) {
        getManager(SoundManager).play(this.object.id(), this.state.sndOpenStart);
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

    if (this.state.noForce === true) {
      this.joint!.set_max_force_and_velocity(0, 0, 0);
    } else {
      this.joint!.set_max_force_and_velocity(2100, -3, 0);
    }

    this.block = false;

    if (this.showTips && this.state.tipClose) {
      this.object.set_tip_text(this.state.tipClose);
    }
  }

  /**
   * todo: Description.
   */
  public closeDoor(disableSound: boolean): void {
    logger.info("Close door: %s %s", this.object.name(), this.state.section);

    if (!disableSound) {
      if (this.state.sndCloseStart !== null) {
        getManager(SoundManager).play(this.object.id(), this.state.sndCloseStart);
      }
    }

    this.object.set_fastcall(this.fastcall, this);

    if (this.state.noForce === true) {
      this.joint!.set_max_force_and_velocity(0, 0, 0);
    } else {
      this.joint!.set_max_force_and_velocity(200, 3, 0);
    }

    this.block = true;
    this.soundlessBlock = disableSound;

    const physicObject: PhysicObject = this.object.get_physics_object();

    physicObject.set_door_ignore_dynamics();

    if (this.showTips) {
      if (this.state.locked === true && this.state.tipUnlock) {
        this.object.set_tip_text(this.state.tipUnlock);

        return;
      }

      if (this.state.tipOpen) {
        this.object.set_tip_text(this.state.tipOpen);
      }
    }
  }

  public override onUse(object: GameObject, who: Optional<GameObject>): void {
    logger.info("Use door: %s", object.name());

    if (this.state.locked && this.state.sndOpenStart) {
      getManager(SoundManager).play(this.object.id(), this.state.sndOpenStart);
    }

    if (this.state.onUse) {
      switchObjectSchemeToSection(
        this.object,
        this.state.ini,
        pickSectionFromCondList(registry.actor, this.object, this.state.onUse.condlist)
      );
    }
  }

  public override onHit(
    object: GameObject,
    amount: TCount,
    direction: Vector,
    who: Optional<GameObject>,
    boneIndex: TIndex
  ): void {
    logger.info("Hit door: %s", object.name());

    if (this.state.hitOnBone.has(boneIndex)) {
      const section: Optional<TSection> = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.hitOnBone.get(boneIndex).state!
      );

      switchObjectSchemeToSection(object, this.state.ini, section!);

      return;
    }
  }
}
