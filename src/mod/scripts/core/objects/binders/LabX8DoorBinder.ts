import {
  callback,
  ini_file,
  LuabindClass,
  object_binder,
  sound_object,
  TXR_sound_object_type,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
  XR_sound_object,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry, resetObject } from "@/mod/scripts/core/database";
import { registerDoorObject, unregisterDoorObject } from "@/mod/scripts/core/database/doors";
import { loadObject, saveObject } from "@/mod/scripts/core/schemes/storing";
import { getConfigNumber, getConfigString, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseConditionsList, TConditionList } from "@/mod/scripts/utils/parse";

const ANIMATED_OBJECT_SECT: string = "animated_object";
const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo
 */
@LuabindClass()
export class LabX8DoorBinder extends object_binder {
  public loaded: boolean = false;
  public anim_time: Optional<number> = 0;

  public is_idle: boolean = true;
  public is_play_fwd: boolean = false;

  public idle_snd: Optional<XR_sound_object> = null;
  public start_snd: Optional<XR_sound_object> = null;
  public stop_snd: Optional<XR_sound_object> = null;

  public idle_delay!: number;
  public start_delay!: number;
  public tip!: TConditionList;

  public on_use!: TConditionList;
  public on_stop!: TConditionList;
  public on_start!: TConditionList;

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);

    let ini: XR_ini_file = object.spawn_ini()!;

    if (!ini.section_exist(ANIMATED_OBJECT_SECT)) {
      logger.info("[animated object] no configuration!", object.name());

      return;
    }

    const filename = getConfigString(ini, ANIMATED_OBJECT_SECT, "cfg", null, false, "", null);

    if (filename) {
      ini = new ini_file(filename);
    }

    // -- this.idle = 5000
    // -- this.idle_end = 0

    const idle_snd: string = getConfigString(
      ini,
      ANIMATED_OBJECT_SECT,
      "idle_snd",
      null,
      false,
      "",
      "device\\airtight_door_idle"
    );
    const start_snd: string = getConfigString(
      ini,
      ANIMATED_OBJECT_SECT,
      "start_snd",
      null,
      false,
      "",
      "device\\airtight_door_start"
    );
    const stop_snd: string = getConfigString(
      ini,
      ANIMATED_OBJECT_SECT,
      "stop_snd",
      null,
      false,
      "",
      "device\\airtight_door_stop"
    );

    if (idle_snd !== null && idle_snd !== "nil") {
      this.idle_snd = new sound_object(idle_snd);
    }

    if (start_snd !== null && start_snd !== "nil") {
      this.start_snd = new sound_object(start_snd);
    }

    if (stop_snd !== null && stop_snd !== "nil") {
      this.stop_snd = new sound_object(stop_snd);
    }

    this.tip = parseConditionsList(
      null,
      "door_binder_labx8",
      "tip_condlist",
      getConfigString(ini, ANIMATED_OBJECT_SECT, "tip", null, false, "", "none")
    );

    let on_use = "true";
    let on_start = "true";
    let on_stop = "true";

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_use")) {
      on_use = ini.r_string(ANIMATED_OBJECT_SECT, "on_use");
    }

    this.on_use = parseConditionsList(null, "door_binder_labx8", "on_use", on_use);

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_start")) {
      on_start = ini.r_string(ANIMATED_OBJECT_SECT, "on_start");
    }

    this.on_start = parseConditionsList(null, "door_binder_labx8", "on_start", on_start);

    if (ini.line_exist(ANIMATED_OBJECT_SECT, "on_stop")) {
      on_stop = ini.r_string(ANIMATED_OBJECT_SECT, "on_stop");
    }

    this.on_stop = parseConditionsList(null, "door_binder_labx8", "on_stop", on_stop);
    this.idle_delay = getConfigNumber(ini, ANIMATED_OBJECT_SECT, "idle_delay", null, false, 2000);
    this.start_delay = getConfigNumber(ini, ANIMATED_OBJECT_SECT, "start_delay", null, false, 0);
  }

  /**
   * todo;
   */
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerDoorObject(this.object, this);

    this.object.get_physics_object().stop_anim();
    this.object.get_physics_object().anim_time_set(0);
    this.object.set_callback(callback.script_animation, this.animation_end_callback, this);
    this.object.set_callback(callback.use_object, this.use_callback, this);

    return true;
  }

  /**
   * todo;
   */
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
    unregisterDoorObject(this.object);
    super.net_destroy();
  }

  /**
   * todo;
   */
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

  /**
   * todo;
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
   * todo;
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
   * todo;
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
   * todo;
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
   * todo;
   */
  public use_callback(object: XR_game_object): void {
    pickSectionFromCondList(registry.actor, object, this.on_use);
  }

  /**
   * todo;
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, LabX8DoorBinder.__name);

    super.save(packet);
    saveObject(this.object, packet);
    packet.w_bool(this.is_idle);
    packet.w_bool(this.is_play_fwd);
    packet.w_float(this.object.get_physics_object().anim_time_get());

    setSaveMarker(packet, true, LabX8DoorBinder.__name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, LabX8DoorBinder.__name);

    super.load(reader);
    loadObject(this.object, reader);
    this.is_idle = reader.r_bool();
    this.is_play_fwd = reader.r_bool();
    this.anim_time = reader.r_float();
    this.loaded = true;

    setLoadMarker(reader, true, LabX8DoorBinder.__name);
  }
}
