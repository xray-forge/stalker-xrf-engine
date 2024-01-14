import { callback, CPhysicObject, ini_file, LuabindClass, object_binder, sound_object } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registry,
  resetObject,
} from "@/engine/core/database";
import { registerDoor, unregisterDoor } from "@/engine/core/database/doors";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import {
  parseConditionsList,
  parseStringOptional,
  pickSectionFromCondList,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TRUE } from "@/engine/lib/constants/words";
import {
  ESoundObjectType,
  GameObject,
  IniFile,
  NetPacket,
  Optional,
  Reader,
  ServerObject,
  SoundObject,
  TDuration,
  TLabel,
  TName,
  TPath,
  TSoundObjectType,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder of door game objects.
 * Handles animation scripting with open-closed state.
 */
@LuabindClass()
export class DoorBinder extends object_binder {
  public isLoaded: boolean = false;
  public isIdle: boolean = true;
  public isPlayingForward: boolean = false;

  public animationDuration: Optional<TDuration> = 0;

  public idleSound: Optional<SoundObject> = null;
  public startSound: Optional<SoundObject> = null;
  public stopSound: Optional<SoundObject> = null;

  public onUseConditionList!: TConditionList;
  public onStopConditionList!: TConditionList;
  public onStartConditionList!: TConditionList;
  public tipConditionList!: TConditionList;

  public idleDelay!: TDuration;
  public startDelay!: TDuration;

  public constructor(object: GameObject) {
    super(object);

    let ini: IniFile = object.spawn_ini()!;

    if (!ini.section_exist("animated_object")) {
      logger.info("No animation configuration for bound door '%s'", object.name());

      return;
    }

    const filename: Optional<TName> = readIniString(ini, "animated_object", "cfg");

    if (filename) {
      ini = new ini_file(filename);
    }

    const idleSound: Optional<TPath> = parseStringOptional(
      readIniString(ini, "animated_object", "idle_snd", false, null, "device\\airtight_door_idle")
    );
    const startSound: Optional<TPath> = parseStringOptional(
      readIniString(ini, "animated_object", "start_snd", false, null, "device\\airtight_door_start")
    );
    const stopSound: Optional<TPath> = parseStringOptional(
      readIniString(ini, "animated_object", "stop_snd", false, null, "device\\airtight_door_stop")
    );

    this.idleSound = idleSound ? new sound_object(idleSound) : null;
    this.startSound = startSound ? new sound_object(startSound) : null;
    this.stopSound = stopSound ? new sound_object(stopSound) : null;

    this.startDelay = readIniNumber(ini, "animated_object", "start_delay", false, 0);
    this.idleDelay = readIniNumber(ini, "animated_object", "idle_delay", false, 2000);

    this.tipConditionList = parseConditionsList(readIniString(ini, "animated_object", "tip", false, null, "none"));

    this.onUseConditionList = parseConditionsList(readIniString(ini, "animated_object", "on_use", false, null, TRUE));
    this.onStartConditionList = parseConditionsList(
      readIniString(ini, "animated_object", "on_start", false, null, TRUE)
    );
    this.onStopConditionList = parseConditionsList(readIniString(ini, "animated_object", "on_stop", false, null, TRUE));
  }

  public override reinit(): void {
    super.reinit();

    resetObject(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerDoor(this);

    this.object.set_callback(callback.script_animation, this.onAnimation, this);
    this.object.set_callback(callback.use_object, this.onUse, this);

    const physicObject: CPhysicObject = this.object.get_physics_object();

    physicObject.stop_anim();
    physicObject.anim_time_set(0);

    return true;
  }

  public override net_destroy(): void {
    this.object.clear_callbacks();

    if (this.idleSound) {
      this.idleSound.stop();
    }

    if (this.startSound) {
      this.startSound.stop();
    }

    if (this.stopSound) {
      this.stopSound.stop();
    }

    unregisterDoor(this);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (this.animationDuration && this.isLoaded) {
      this.object.get_physics_object().anim_time_set(this.animationDuration);
      this.animationDuration = null;
    }

    if (!this.isIdle) {
      if (this.isPlayingForward) {
        this.object.get_physics_object().run_anim_forward();
      } else {
        this.object.get_physics_object().run_anim_back();
      }
    } else {
      this.object.get_physics_object().stop_anim();
      if (this.animationDuration) {
        this.object.get_physics_object().anim_time_set(this.animationDuration);
      }

      if (this.idleSound) {
        this.idleSound.stop();
      }
    }

    const doorUseTipLabel: TLabel = pickSectionFromCondList(registry.actor, null, this.tipConditionList)!;

    this.object.set_tip_text(doorUseTipLabel !== "none" ? doorUseTipLabel : "");
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, DoorBinder.__name);

    super.save(packet);

    saveObjectLogic(this.object, packet);

    packet.w_bool(this.isIdle);
    packet.w_bool(this.isPlayingForward);
    packet.w_float(this.object.get_physics_object().anim_time_get());

    closeSaveMarker(packet, DoorBinder.__name);
  }

  public override load(reader: Reader): void {
    openLoadMarker(reader, DoorBinder.__name);

    super.load(reader);

    this.isLoaded = true;

    loadObjectLogic(this.object, reader);

    this.isIdle = reader.r_bool();
    this.isPlayingForward = reader.r_bool();
    this.animationDuration = reader.r_float();

    closeLoadMarker(reader, DoorBinder.__name);
  }

  /**
   * Starts forward animation of the door.
   */
  public startForwardAnimation(): void {
    const object: GameObject = this.object;

    this.isIdle = false;
    this.isPlayingForward = true;

    if (this.idleSound) {
      this.idleSound.stop();
    }

    object.get_physics_object().stop_anim();

    if (this.startSound) {
      this.startSound.play_at_pos(object, object.position(), this.startDelay / 1_000, ESoundObjectType.S3D);
    }

    if (this.idleSound) {
      this.idleSound.play_at_pos(
        object,
        object.position(),
        (this.startDelay + this.idleDelay) / 1000,
        (ESoundObjectType.S3D + ESoundObjectType.LOOPED) as TSoundObjectType
      );
    }

    pickSectionFromCondList(registry.actor, object, this.onStartConditionList);
  }

  /**
   * Starts backward animation of the door.
   */
  public startBackwardAnimation(): void {
    const object: GameObject = this.object;

    this.isIdle = false;
    this.isPlayingForward = false;

    if (this.idleSound) {
      this.idleSound.stop();
    }

    object.get_physics_object().stop_anim();

    if (this.startSound) {
      this.startSound.play_at_pos(object, object.position(), this.startDelay / 1_000, ESoundObjectType.S3D);
    }

    if (this.idleSound) {
      this.idleSound.play_at_pos(
        object,
        object.position(),
        (this.startDelay + this.idleDelay) / 1_000,
        (ESoundObjectType.S3D + ESoundObjectType.LOOPED) as TSoundObjectType
      );
    }

    pickSectionFromCondList(registry.actor, object, this.onStartConditionList);
  }

  /**
   * Stop door animation and emit related events.
   */
  public stopAnimation(): void {
    const object: GameObject = this.object;

    this.isIdle = true;
    object.get_physics_object().stop_anim();

    if (this.stopSound) {
      this.stopSound.play_at_pos(object, object.position(), 0, ESoundObjectType.S3D);
    }

    this.animationDuration = object.get_physics_object().anim_time_get();

    pickSectionFromCondList(registry.actor, object, this.onStopConditionList);
  }

  /**
   * Handle animation event callback.
   *
   * @param isEnd - whether it is end or start of the animation
   */
  public onAnimation(isEnd?: Optional<boolean>): void {
    if (isEnd) {
      const object: GameObject = this.object;

      if (this.stopSound) {
        this.stopSound.play_at_pos(object, object.position(), 0, ESoundObjectType.S3D);
      }

      this.isIdle = true;
      this.animationDuration = object.get_physics_object().anim_time_get();

      pickSectionFromCondList(registry.actor, object, this.onStopConditionList);
    }
  }

  /**
   * Handle door usage logics.
   *
   * @param object - game object used
   */
  public onUse(object: GameObject): void {
    pickSectionFromCondList(registry.actor, object, this.onUseConditionList);
  }
}
