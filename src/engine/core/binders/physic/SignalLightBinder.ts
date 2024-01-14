import { LuabindClass, object_binder, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registerSignalLight,
  registry,
  unregisterSignalLight,
} from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { Y_VECTOR } from "@/engine/lib/constants/vectors";
import { NetPacket, Optional, Reader, ServerObject, TDuration, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Signal light object.
 * Shown in the sky when surge happens and safe stalker bases are signaling about secure point.
 * Starts with fast signal light animation and then slowly falls after few seconds.
 *
 * Example: check zaton stalker base sky after surge start
 */
@LuabindClass()
export class SignalLightBinder extends object_binder {
  public isLoaded: boolean = false;
  public isSlowFlyStarted: boolean = false;
  public isHangingAnimationTurnedOn: boolean = false;

  public loadedAt: Optional<TTimestamp> = null;
  public startTime: Optional<TTimestamp> = null;

  public override reinit(): void {
    super.reinit();

    registerSignalLight(this);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerSignalLight(this);

    return true;
  }

  public override net_destroy(): void {
    unregisterSignalLight(this);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    // Is not started.
    if (!this.startTime) {
      if (this.isHangingAnimationTurnedOn) {
        this.isHangingAnimationTurnedOn = false;
        this.object.get_hanging_lamp().turn_off();
      }

      this.isLoaded = false;

      return;
    }

    const now: TTimestamp = time_global();

    // Recalculate fly time-force after game load.
    if (this.isLoaded) {
      this.startTime = now + this.startTime - (this.loadedAt as TDuration);
      this.isLoaded = false;
      this.loadedAt = null;

      const duration: TDuration = now - this.startTime;

      if (duration < 1500) {
        this.object.set_const_force(Y_VECTOR, 180 + math.floor(duration / 5), 1500 - duration);
        this.object.start_particles("weapons\\light_signal", "link");
      } else if (duration < 20_000) {
        this.object.set_const_force(Y_VECTOR, 33, 20000 - duration);
        this.object.start_particles("weapons\\light_signal", "link");
      }
    } else {
      const duration: TDuration = now - this.startTime;

      if (duration > 28_500) {
        this.startTime = null;
      } else if (duration > 20_500) {
        // Stop slow flying force.
        if (this.isSlowFlyStarted) {
          logger.info("Stop signal light fly: %s", this.object.name());

          this.isSlowFlyStarted = false;
          this.isHangingAnimationTurnedOn = false;

          this.object.stop_particles("weapons\\light_signal", "link");
          this.object.get_hanging_lamp().turn_off();
        }
      } else if (duration > 1_500) {
        // Start slow flying with smaller force impact.
        if (!this.isSlowFlyStarted) {
          this.isSlowFlyStarted = true;
          this.isHangingAnimationTurnedOn = true;

          logger.info("Start signal light slow fly: %s", this.object.name());

          this.object.set_const_force(Y_VECTOR, 30, 20_000);
          this.object.start_particles("weapons\\light_signal", "link");
          this.object.get_hanging_lamp().turn_on();
        }
      }
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, SignalLightBinder.__name);

    super.save(packet);

    packet.w_u32(this.startTime === null ? -1 : time_global() - this.startTime);
    packet.w_bool(this.isSlowFlyStarted);

    closeSaveMarker(packet, SignalLightBinder.__name);
  }

  public override load(reader: Reader): void {
    openLoadMarker(reader, SignalLightBinder.__name);

    super.load(reader);

    const now: TTimestamp = time_global();
    const time: TTimestamp = reader.r_u32();

    this.startTime = time === MAX_U32 ? null : now - time;
    this.isSlowFlyStarted = reader.r_bool();

    this.loadedAt = now;
    this.isLoaded = true;

    closeLoadMarker(reader, SignalLightBinder.__name);
  }

  /**
   * @returns whether signal light is flying right now
   */
  public isFlying(): boolean {
    return this.startTime !== null;
  }

  /**
   * Start fly animation if it is not started already.
   * Forces light object to fly up with high impact.
   *
   * @returns whether fly animation was started
   */
  public startFly(): boolean {
    if (this.startTime !== null || registry.actor === null) {
      return false;
    }

    logger.info("Start signal light fly: %s", this.object.name());

    this.startTime = time_global();
    this.isSlowFlyStarted = false;

    this.object.set_const_force(Y_VECTOR, 180, 1_500);

    return true;
  }

  /**
   * Force stop flying animations.
   */
  public stopFly(): void {
    logger.info("Stop signal light immediately: %s", this.object.name());

    this.startTime = null;

    if (this.isSlowFlyStarted) {
      this.isSlowFlyStarted = false;
      this.isHangingAnimationTurnedOn = false;
      this.object.stop_particles("weapons\\light_signal", "link");
      this.object.get_hanging_lamp().turn_off();
    }
  }
}
