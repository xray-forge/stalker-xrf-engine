import {
  object_binder,
  time_global,
  vector,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_object_binder
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { getActor, signalLight, storage } from "@/mod/scripts/core/db";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("SignalLightBinder");

export interface ISignalLightBinder extends XR_object_binder {
  need_turn_off: boolean;
  loaded: boolean;
  slow_fly_started: boolean;

  delta_time: Optional<number>;
  start_time: Optional<number>;

  launch(): boolean;
  slow_fly(): void;
  stop_light(): void;
  stop(): void;
  is_flying(): boolean;
}

export const SignalLightBinder: ISignalLightBinder = declare_xr_class("SignalLightBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);
    this.need_turn_off = true;
    // --  this.initialized = false
    this.loaded = false;
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    storage.set(this.object.id(), {});
    signalLight.set(this.object.name(), this);
  },
  update(delta: number): void {
    object_binder.update(this, delta);

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
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    log.info("Net spawn:", this.object.name());

    return true;
  },
  net_destroy(): void {
    log.info("Net destroy:", this.object.name());
    signalLight.delete(this.object.name());
    object_binder.net_destroy(this);
  },
  launch(): boolean {
    const actor: Optional<XR_game_object> = getActor();

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
  },
  slow_fly(): void {
    this.slow_fly_started = true;
    this.object.set_const_force(new vector().set(0, 1, 0), 30, 20000);
  },
  stop_light(): void {
    const obj: XR_game_object = this.object;

    this.slow_fly_started = false;

    obj.stop_particles("weapons\\light_signal", "link");
    obj.get_hanging_lamp().turn_off();
  },
  stop(): void {
    this.start_time = null;
  },
  is_flying(): boolean {
    return this.start_time !== null;
  },
  net_save_relevant(): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, SignalLightBinder.__name);

    object_binder.save(this, packet);

    if (this.start_time == null) {
      packet.w_u32(-1);
    } else {
      packet.w_u32(time_global() - this.start_time);
    }

    packet.w_bool(this.slow_fly_started === true);

    setSaveMarker(packet, true, SignalLightBinder.__name);
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, SignalLightBinder.__name);

    object_binder.load(this, packet);

    const time = packet.r_u32();

    if (time !== 4294967296) {
      this.start_time = time_global() - time;
    }

    this.slow_fly_started = packet.r_bool();
    this.loaded = true;
    this.delta_time = time_global();

    setLoadMarker(packet, true, SignalLightBinder.__name);
  }
} as ISignalLightBinder);
