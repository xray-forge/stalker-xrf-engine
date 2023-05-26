import {
  callback,
  cse_alife_object,
  game_object,
  ini_file,
  LuabindClass,
  net_packet,
  object_binder,
  reader,
  sound_object,
  TXR_sound_object_type,
} from "xray16";

import { closeLoadMarker, closeSaveMarker, openSaveMarker, registry, resetObject } from "@/engine/core/database";
import { registerDoor, unregisterDoor } from "@/engine/core/database/doors";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { Optional, TName } from "@/engine/lib/types";

const ANIMATED_OBJECT_SECT: string = "animated_object";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: Rename to animated door?
 */
@LuabindClass()
export class LabX8DoorBinder extends object_binder {
  public loaded: boolean = false;
  public anim_time: Optional<number> = 0;

  public is_idle: boolean = true;
  public is_play_fwd: boolean = false;

  public idle_snd: Optional<sound_object> = null;
  public start_snd: Optional<sound_object> = null;
  public stop_snd: Optional<sound_object> = null;

  public idle_delay!: number;
  public start_delay!: number;
  public tip!: TConditionList;

  public on_use!: TConditionList;
  public on_stop!: TConditionList;
  public on_start!: TConditionList;

  public constructor(object: game_object) {
    super(object);

    let ini: ini_file = object.spawn_ini()!;

    if (!ini.section_exist(ANIMATED_OBJECT_SECT)) {
      logger.info("[animated object] no configuration!", object.name());

      return;
    }

    const filename: Optional<TName> = readIniString(ini, ANIMATED_OBJECT_SECT, "cfg", false, "", null);

    if (filename) {
      ini = new ini_file(filename);
    }

    // -- this.idle = 5000
    // -- this.idle_end = 0

    const idle_snd: string = readIniString(
      ini,
      ANIMATED_OBJECT_SECT,
      "idle_snd",
      false,
      "",
      "device\\airtight_door_idle"
    );
    const start_snd: string = readIniString(
      ini,
      ANIMATED_OBJECT_SECT,
      "start_snd",
      false,
      "",
      "device\\airtight_door_start"
    );
    const stop_snd: string = readIniString(
      ini,
      ANIMATED_OBJECT_SECT,
      "stop_snd",
      false,
      "",
      "device\\airtight_door_stop"
    );

    if (idle_snd !== null && idle_snd !== NIL) {
      this.idle_snd = new sound_object(idle_snd);
    }

    if (start_snd !== null && start_snd !== NIL) {
      this.start_snd = new sound_object(start_snd);
    }

    if (stop_snd !== null && stop_snd !== NIL) {
      this.stop_snd = new sound_object(stop_snd);
    }

    this.tip = parseConditionsList(readIniString(ini, ANIMATED_OBJECT_SECT, "tip", false, "", "none"));

    let on_use: string = TRUE;
    let on_start: string = TRUE;
    let on_stop: string = TRUE;

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_use")) {
      on_use = ini.r_string(ANIMATED_OBJECT_SECT, "on_use");
    }

    this.on_use = parseConditionsList(on_use);

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_start")) {
      on_start = ini.r_string(ANIMATED_OBJECT_SECT, "on_start");
    }

    this.on_start = parseConditionsList(on_start);

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_stop")) {
      on_stop = ini.r_string(ANIMATED_OBJECT_SECT, "on_stop");
    }

    this.on_stop = parseConditionsList(on_stop);
    this.idle_delay = readIniNumber(ini, ANIMATED_OBJECT_SECT, "idle_delay", false, 2000);
    this.start_delay = readIniNumber(ini, ANIMATED_OBJECT_SECT, "start_delay", false, 0);
  }

  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  public override net_spawn(object: cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerDoor(this);

    this.object.get_physics_object().stop_anim();
    this.object.get_physics_object().anim_time_set(0);
    this.object.set_callback(callback.script_animation, this.animation_end_callback, this);
    this.object.set_callback(callback.use_object, this.use_callback, this);

    return true;
  }

  public override net_destroy(): void {
    if (this.idle_snd) {
      this.idle_snd.stop();
    }

    if (this.start_snd) {
      this.start_snd.stop();
    }

    if (this.stop_snd) {
      this.stop_snd.stop();
    }

    this.object.set_callback(callback.script_animation, null);
    unregisterDoor(this);
    super.net_destroy();
  }

  public override update(delta: number): void {
    super.update(delta);

    if (this.anim_time && this.loaded) {
      this.object.get_physics_object().anim_time_set(this.anim_time);
      this.anim_time = null;
    }

    if (!this.is_idle) {
      // --        if(this.idle_end<=game.time()) {
      if (this.is_play_fwd) {
        this.object.get_physics_object().run_anim_forward();
      } else {
        this.object.get_physics_object().run_anim_back();
      }
      // --        }
    } else {
      this.object.get_physics_object().stop_anim();
      if (this.anim_time) {
        this.object.get_physics_object().anim_time_set(this.anim_time);
      }

      if (this.idle_snd) {
        this.idle_snd.stop();
      }
    }

    const tip_string: string = pickSectionFromCondList(registry.actor, null, this.tip)!;

    if (tip_string !== "none") {
      this.object.set_tip_text(tip_string);
    } else {
      this.object.set_tip_text("");
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: net_packet): void {
    openSaveMarker(packet, LabX8DoorBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);
    packet.w_bool(this.is_idle);
    packet.w_bool(this.is_play_fwd);
    packet.w_float(this.object.get_physics_object().anim_time_get());

    closeSaveMarker(packet, LabX8DoorBinder.__name);
  }

  public override load(reader: reader): void {
    openLoadMarker(reader, LabX8DoorBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);
    this.is_idle = reader.r_bool();
    this.is_play_fwd = reader.r_bool();
    this.anim_time = reader.r_float();
    this.loaded = true;

    closeLoadMarker(reader, LabX8DoorBinder.__name);
  }

  /**
   * todo: Description.
   */
  public anim_forward(): void {
    if (this.idle_snd) {
      this.idle_snd.stop();
    }

    this.object.get_physics_object().stop_anim();
    // --    this.idle_end = this.idle + game.time()
    if (this.start_snd) {
      this.start_snd.play_at_pos(this.object, this.object.position(), this.start_delay / 1000, sound_object.s3d);
    }

    if (this.idle_snd) {
      this.idle_snd.play_at_pos(
        this.object,
        this.object.position(),
        (this.start_delay + this.idle_delay) / 1000,
        (sound_object.s3d + sound_object.looped) as TXR_sound_object_type
      );
    }

    this.is_idle = false;
    this.is_play_fwd = true;

    pickSectionFromCondList(registry.actor, this.object, this.on_start);
  }

  /**
   * todo: Description.
   */
  public anim_backward(): void {
    if (this.idle_snd) {
      this.idle_snd.stop();
    }

    this.object.get_physics_object().stop_anim();
    // --    this.idle_end = this.idle + game.time()
    if (this.start_snd) {
      this.start_snd.play_at_pos(this.object, this.object.position(), this.start_delay / 1000, sound_object.s3d);
    }

    if (this.idle_snd) {
      this.idle_snd.play_at_pos(
        this.object,
        this.object.position(),
        (this.start_delay + this.idle_delay) / 1000,
        (sound_object.s3d + sound_object.looped) as TXR_sound_object_type
      );
    }

    this.is_idle = false;
    this.is_play_fwd = false;
    pickSectionFromCondList(registry.actor, this.object, this.on_start);
  }

  /**
   * todo: Description.
   */
  public anim_stop(): void {
    this.object.get_physics_object().stop_anim();
    this.is_idle = true;
    if (this.stop_snd) {
      this.stop_snd.play_at_pos(this.object, this.object.position(), 0, sound_object.s3d);
    }

    this.anim_time = this.object.get_physics_object().anim_time_get();
    pickSectionFromCondList(registry.actor, this.object, this.on_stop);
  }

  /**
   * todo: Description.
   */
  public animation_end_callback(is_end?: boolean): void {
    if (is_end) {
      if (this.stop_snd) {
        this.stop_snd.play_at_pos(this.object, this.object.position(), 0, sound_object.s3d);
      }

      this.is_idle = true;
      this.anim_time = this.object.get_physics_object().anim_time_get();
      pickSectionFromCondList(registry.actor, this.object, this.on_stop);
    }
  }

  /**
   * todo: Description.
   */
  public use_callback(object: game_object): void {
    pickSectionFromCondList(registry.actor, object, this.on_use);
  }
}
