import { callback, ini_file, LuabindClass, object_binder, sound_object } from "xray16";

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
  pickSectionFromCondList,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import {
  ESoundObjectType,
  GameObject,
  IniFile,
  NetPacket,
  Optional,
  Reader,
  ServerObject,
  SoundObject,
  TLabel,
  TName,
  TPath,
  TSoundObjectType,
} from "@/engine/lib/types";

const ANIMATED_OBJECT_SECT: string = "animated_object";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder of door game objects.
 * todo: Rename to animated door?
 */
@LuabindClass()
export class LabX8DoorBinder extends object_binder {
  public loaded: boolean = false;
  public animationTime: Optional<number> = 0;

  public isIdle: boolean = true;
  public isPlayFwd: boolean = false;

  public idleSound: Optional<SoundObject> = null;
  public startSound: Optional<SoundObject> = null;
  public stopSound: Optional<SoundObject> = null;

  public idleDelay!: number;
  public startDelay!: number;
  public tip!: TConditionList;

  public onUseConditionList!: TConditionList;
  public onStopConditionList!: TConditionList;
  public onStartConditionList!: TConditionList;

  public constructor(object: GameObject) {
    super(object);

    let ini: IniFile = object.spawn_ini()!;

    if (!ini.section_exist(ANIMATED_OBJECT_SECT)) {
      logger.info("[animated object] no configuration! %s", object.name());

      return;
    }

    const filename: Optional<TName> = readIniString(ini, ANIMATED_OBJECT_SECT, "cfg", false);

    if (filename) {
      ini = new ini_file(filename);
    }

    // -- this.idle = 5000

    const idleSound: TPath = readIniString(
      ini,
      ANIMATED_OBJECT_SECT,
      "idle_snd",
      false,
      null,
      "device\\airtight_door_idle"
    );
    const startSound: TPath = readIniString(
      ini,
      ANIMATED_OBJECT_SECT,
      "start_snd",
      false,
      null,
      "device\\airtight_door_start"
    );
    const stopSound: TPath = readIniString(
      ini,
      ANIMATED_OBJECT_SECT,
      "stop_snd",
      false,
      null,
      "device\\airtight_door_stop"
    );

    if (idleSound !== null && idleSound !== NIL) {
      this.idleSound = new sound_object(idleSound);
    }

    if (startSound !== null && startSound !== NIL) {
      this.startSound = new sound_object(startSound);
    }

    if (stopSound !== null && stopSound !== NIL) {
      this.stopSound = new sound_object(stopSound);
    }

    this.tip = parseConditionsList(readIniString(ini, ANIMATED_OBJECT_SECT, "tip", false, null, "none"));

    let onUse: string = TRUE;
    let onStart: string = TRUE;
    let onStop: string = TRUE;

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_use")) {
      onUse = ini.r_string(ANIMATED_OBJECT_SECT, "on_use");
    }

    this.onUseConditionList = parseConditionsList(onUse);

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_start")) {
      onStart = ini.r_string(ANIMATED_OBJECT_SECT, "on_start");
    }

    this.onStartConditionList = parseConditionsList(onStart);

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_stop")) {
      onStop = ini.r_string(ANIMATED_OBJECT_SECT, "on_stop");
    }

    this.onStopConditionList = parseConditionsList(onStop);
    this.idleDelay = readIniNumber(ini, ANIMATED_OBJECT_SECT, "idle_delay", false, 2000);
    this.startDelay = readIniNumber(ini, ANIMATED_OBJECT_SECT, "start_delay", false, 0);
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

    this.object.get_physics_object().stop_anim();
    this.object.get_physics_object().anim_time_set(0);
    this.object.set_callback(callback.script_animation, this.onAnimationEnd, this);
    this.object.set_callback(callback.use_object, this.onUse, this);

    return true;
  }

  public override net_destroy(): void {
    if (this.idleSound) {
      this.idleSound.stop();
    }

    if (this.startSound) {
      this.startSound.stop();
    }

    if (this.stopSound) {
      this.stopSound.stop();
    }

    this.object.set_callback(callback.script_animation, null);
    unregisterDoor(this);
    super.net_destroy();
  }

  public override update(delta: number): void {
    super.update(delta);

    if (this.animationTime && this.loaded) {
      this.object.get_physics_object().anim_time_set(this.animationTime);
      this.animationTime = null;
    }

    if (!this.isIdle) {
      if (this.isPlayFwd) {
        this.object.get_physics_object().run_anim_forward();
      } else {
        this.object.get_physics_object().run_anim_back();
      }
      // --        }
    } else {
      this.object.get_physics_object().stop_anim();
      if (this.animationTime) {
        this.object.get_physics_object().anim_time_set(this.animationTime);
      }

      if (this.idleSound) {
        this.idleSound.stop();
      }
    }

    const usageTipLabel: TLabel = pickSectionFromCondList(registry.actor, null, this.tip)!;

    if (usageTipLabel !== "none") {
      this.object.set_tip_text(usageTipLabel);
    } else {
      this.object.set_tip_text("");
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, LabX8DoorBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);
    packet.w_bool(this.isIdle);
    packet.w_bool(this.isPlayFwd);
    packet.w_float(this.object.get_physics_object().anim_time_get());

    closeSaveMarker(packet, LabX8DoorBinder.__name);
  }

  public override load(reader: Reader): void {
    openLoadMarker(reader, LabX8DoorBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);
    this.isIdle = reader.r_bool();
    this.isPlayFwd = reader.r_bool();
    this.animationTime = reader.r_float();
    this.loaded = true;

    closeLoadMarker(reader, LabX8DoorBinder.__name);
  }

  /**
   * todo: Description.
   */
  public forwardAnimation(): void {
    if (this.idleSound) {
      this.idleSound.stop();
    }

    this.object.get_physics_object().stop_anim();
    if (this.startSound) {
      this.startSound.play_at_pos(this.object, this.object.position(), this.startDelay / 1000, ESoundObjectType.S3D);
    }

    if (this.idleSound) {
      this.idleSound.play_at_pos(
        this.object,
        this.object.position(),
        (this.startDelay + this.idleDelay) / 1000,
        (ESoundObjectType.S3D + ESoundObjectType.LOOPED) as TSoundObjectType
      );
    }

    this.isIdle = false;
    this.isPlayFwd = true;

    pickSectionFromCondList(registry.actor, this.object, this.onStartConditionList);
  }

  /**
   * todo: Description.
   */
  public backwardAnimation(): void {
    if (this.idleSound) {
      this.idleSound.stop();
    }

    this.object.get_physics_object().stop_anim();
    if (this.startSound) {
      this.startSound.play_at_pos(this.object, this.object.position(), this.startDelay / 1000, ESoundObjectType.S3D);
    }

    if (this.idleSound) {
      this.idleSound.play_at_pos(
        this.object,
        this.object.position(),
        (this.startDelay + this.idleDelay) / 1000,
        (ESoundObjectType.S3D + ESoundObjectType.LOOPED) as TSoundObjectType
      );
    }

    this.isIdle = false;
    this.isPlayFwd = false;
    pickSectionFromCondList(registry.actor, this.object, this.onStartConditionList);
  }

  /**
   * todo: Description.
   */
  public stopAnimation(): void {
    this.object.get_physics_object().stop_anim();
    this.isIdle = true;
    if (this.stopSound) {
      this.stopSound.play_at_pos(this.object, this.object.position(), 0, ESoundObjectType.S3D);
    }

    this.animationTime = this.object.get_physics_object().anim_time_get();
    pickSectionFromCondList(registry.actor, this.object, this.onStopConditionList);
  }

  /**
   * todo: Description.
   */
  public onAnimationEnd(isEnd?: boolean): void {
    if (isEnd) {
      if (this.stopSound) {
        this.stopSound.play_at_pos(this.object, this.object.position(), 0, ESoundObjectType.S3D);
      }

      this.isIdle = true;
      this.animationTime = this.object.get_physics_object().anim_time_get();
      pickSectionFromCondList(registry.actor, this.object, this.onStopConditionList);
    }
  }

  /**
   * todo: Description.
   */
  public onUse(object: GameObject): void {
    pickSectionFromCondList(registry.actor, object, this.onUseConditionList);
  }
}
