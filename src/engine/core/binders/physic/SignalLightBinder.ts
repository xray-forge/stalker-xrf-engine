import { LuabindClass, object_binder, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registry,
  resetObject,
  unregisterObject,
} from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createVector } from "@/engine/core/utils/vector";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { GameObject, NetPacket, Optional, Reader, ServerObject, TDuration, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Signal light object.
 * Shown in the sky when surge happens and safe stalker bases are signaling about secure point.
 */
@LuabindClass()
export class SignalLightBinder extends object_binder {
  public isLoaded: boolean = false;
  public isTurnOffNeeded: boolean = true;
  public isSlowFlyStarted: boolean = false;

  public deltaTime: Optional<TTimestamp> = null;
  public startTime: Optional<TTimestamp> = null;

  public override reinit(): void {
    super.reinit();

    resetObject(this.object);
    registry.signalLights.set(this.object.name(), this);
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (this.startTime === null) {
      if (this.isTurnOffNeeded) {
        this.object.get_hanging_lamp().turn_off();
        this.isTurnOffNeeded = false;
        this.isLoaded = false;
      }

      return;
    }

    const now: TTimestamp = time_global();
    let flyTime: TDuration = now - this.startTime;

    if (this.isLoaded) {
      this.startTime = this.startTime + now - this.deltaTime!;
      this.deltaTime = null;
      this.isLoaded = false;

      flyTime = now - this.startTime;

      if (flyTime < 1500) {
        this.object.set_const_force(createVector(0, 1, 0), 180 + math.floor(flyTime / 5), 1500 - flyTime);
        this.object.start_particles("weapons\\light_signal", "link");
      } else if (flyTime < 20000) {
        this.object.set_const_force(createVector(0, 1, 0), 33, 20000 - flyTime);
        this.object.start_particles("weapons\\light_signal", "link");
      }

      return;
    }

    // Magical constants.
    if (flyTime > 28_500) {
      this.stop();

      return;
    }

    if (flyTime > 20_500) {
      this.stopLight();

      return;
    }

    if (flyTime > 1_500) {
      if (this.isSlowFlyStarted !== true) {
        this.startSlowFly();
        this.object.start_particles("weapons\\light_signal", "link");
        this.object.get_hanging_lamp().turn_on();
      }
    }
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    return true;
  }

  public override net_destroy(): void {
    registry.signalLights.delete(this.object.name());
    unregisterObject(this.object);
    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public launch(): boolean {
    const actor: Optional<GameObject> = registry.actor;

    if (actor === null) {
      return false;
    }

    if (this.startTime !== null) {
      return false;
    }

    this.object.set_const_force(createVector(0, 1, 0), 180, 1500);

    // --obj:start_particles("weapons\\light_signal", "link")
    // --obj:get_hanging_lamp():turn_on()

    this.startTime = time_global();
    this.isSlowFlyStarted = false;

    return true;
  }

  /**
   * todo: Description.
   */
  public startSlowFly(): void {
    this.isSlowFlyStarted = true;
    this.object.set_const_force(createVector(0, 1, 0), 30, 20_000);
  }

  /**
   * todo: Description.
   */
  public stopLight(): void {
    this.isSlowFlyStarted = false;
    this.object.stop_particles("weapons\\light_signal", "link");
    this.object.get_hanging_lamp().turn_off();
  }

  /**
   * todo: Description.
   */
  public stop(): void {
    this.startTime = null;
  }

  /**
   * todo: Description.
   */
  public isFlying(): boolean {
    return this.startTime !== null;
  }

  /**
   * todo: Description.
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo: Description.
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, SignalLightBinder.__name);

    super.save(packet);

    if (this.startTime === null) {
      packet.w_u32(-1);
    } else {
      packet.w_u32(time_global() - this.startTime);
    }

    packet.w_bool(this.isSlowFlyStarted === true);

    closeSaveMarker(packet, SignalLightBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: Reader): void {
    openLoadMarker(reader, SignalLightBinder.__name);

    super.load(reader);

    const time = reader.r_u32();

    if (time !== MAX_U32) {
      this.startTime = time_global() - time;
    }

    this.isSlowFlyStarted = reader.r_bool();
    this.isLoaded = true;
    this.deltaTime = time_global();

    closeLoadMarker(reader, SignalLightBinder.__name);
  }
}
