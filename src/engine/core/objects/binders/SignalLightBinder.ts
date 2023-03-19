import {
  LuabindClass,
  object_binder,
  time_global,
  vector,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { registry, resetObject, unregisterObject } from "@/engine/core/database";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TDuration } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class SignalLightBinder extends object_binder {
  public need_turn_off: boolean = true;
  public loaded: boolean = false;
  public slow_fly_started: boolean = false;

  public delta_time: Optional<number> = null;
  public start_time: Optional<number> = null;

  /**
   * todo;
   */
  public override reinit(): void {
    super.reinit();

    resetObject(this.object);
    registry.signalLights.set(this.object.name(), this);
  }

  /**
   * todo;
   */
  public override update(delta: TDuration): void {
    super.update(delta);

    const obj = this.object;

    if (this.start_time === null) {
      if (this.need_turn_off) {
        obj.get_hanging_lamp().turn_off();
        this.need_turn_off = false;
        this.loaded = false;
      }

      return;
    }

    let fly_time: number = time_global() - this.start_time;

    if (this.loaded) {
      this.start_time = this.start_time + time_global() - this.delta_time!;
      this.delta_time = null;
      this.loaded = false;

      fly_time = time_global() - this.start_time;

      if (fly_time < 1500) {
        obj.set_const_force(new vector().set(0, 1, 0), 180 + math.floor(fly_time / 5), 1500 - fly_time);
        obj.start_particles("weapons\\light_signal", "link");
      } else if (fly_time < 20000) {
        obj.set_const_force(new vector().set(0, 1, 0), 33, 20000 - fly_time);
        obj.start_particles("weapons\\light_signal", "link");
      }

      return;
    }

    // Magical constants.
    if (fly_time > 28500) {
      this.stop;

      return;
    }

    if (fly_time > 20500) {
      this.stop_light();

      return;
    }

    if (fly_time > 1500) {
      if (this.slow_fly_started !== true) {
        this.slow_fly();
        obj.start_particles("weapons\\light_signal", "link");
        obj.get_hanging_lamp().turn_on();
      }
    }
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Net spawn:", this.object.name());

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());
    registry.signalLights.delete(this.object.name());
    unregisterObject(this.object);
    super.net_destroy();
  }

  /**
   * todo;
   */
  public launch(): boolean {
    const actor: Optional<XR_game_object> = registry.actor;

    if (actor === null) {
      return false;
    }

    if (this.start_time !== null) {
      return false;
    }

    const obj = this.object;

    obj.set_const_force(new vector().set(0, 1, 0), 180, 1500);

    // --obj:start_particles("weapons\\light_signal", "link")
    // --obj:get_hanging_lamp():turn_on()

    this.start_time = time_global();
    this.slow_fly_started = false;

    return true;
  }

  /**
   * todo;
   */
  public slow_fly(): void {
    this.slow_fly_started = true;
    this.object.set_const_force(new vector().set(0, 1, 0), 30, 20000);
  }

  /**
   * todo;
   */
  public stop_light(): void {
    const obj: XR_game_object = this.object;

    this.slow_fly_started = false;

    obj.stop_particles("weapons\\light_signal", "link");
    obj.get_hanging_lamp().turn_off();
  }

  /**
   * todo;
   */
  public stop(): void {
    this.start_time = null;
  }

  /**
   * todo;
   */
  public is_flying(): boolean {
    return this.start_time !== null;
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
    setSaveMarker(packet, false, SignalLightBinder.__name);

    super.save(packet);

    if (this.start_time === null) {
      packet.w_u32(-1);
    } else {
      packet.w_u32(time_global() - this.start_time);
    }

    packet.w_bool(this.slow_fly_started === true);

    setSaveMarker(packet, true, SignalLightBinder.__name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, SignalLightBinder.__name);

    super.load(reader);

    const time = reader.r_u32();

    if (time !== 4_294_967_296) {
      this.start_time = time_global() - time;
    }

    this.slow_fly_started = reader.r_bool();
    this.loaded = true;
    this.delta_time = time_global();

    setLoadMarker(reader, true, SignalLightBinder.__name);
  }
}
