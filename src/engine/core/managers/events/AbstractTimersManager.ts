import { time_global } from "xray16";
import { AnyCallable, assert, TCount, TDuration, TTimestamp } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { IIntervalDescriptor, ITimeoutDescriptor } from "@/engine/core/managers/events/events_types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Abstract intervals manager.
 */
export class AbstractTimersManager extends AbstractManager {
  /**
   * @param callback - Functor to call on defined period.
   * @param period - Period time to call functor, expect values bigger than 50.
   * @returns Cancel, descriptor, callback.
   */
  public static registerGameInterval(
    callback: (offset: TDuration) => void,
    period: TDuration
  ): LuaMultiReturn<[AnyCallable, IIntervalDescriptor, AnyCallable]> {
    return getManager(this).registerGameInterval(callback, period);
  }

  /**
   * @param callback - Functor to call after delay.
   * @param delay - Delay time.
   * @returns Cancel, descriptor, callback.
   */
  public static registerGameTimeout(
    callback: (offset: TDuration) => void,
    delay?: TDuration
  ): LuaMultiReturn<[AnyCallable, ITimeoutDescriptor, AnyCallable]> {
    return getManager(this).registerGameTimeout(callback, delay || 0);
  }

  public readonly intervals: LuaTable<IIntervalDescriptor, boolean> = new LuaTable();
  public readonly timeouts: LuaTable<ITimeoutDescriptor, boolean> = new LuaTable();

  /**
   * Register game interval to call it every `period` time when possible.
   * Guarantees that callback will be called on period and not frequently than `period` time.
   * Some offsets/delays may happen so actual call offset is supplied as parameter to each callback call.
   *
   * @param callback - Functor to call on defined period.
   * @param period - Period time to call functor, expect values bigger than 50.
   * @returns Cancel, descriptor, callback.
   */
  public registerGameInterval(
    callback: (offset: TDuration) => void,
    period: TDuration
  ): LuaMultiReturn<[AnyCallable, IIntervalDescriptor, AnyCallable]> {
    logger.info("Register new interval: %s", period);

    assert(period >= 50, "Low value interval may be problematic.");

    const descriptor: IIntervalDescriptor = { callback, period, last: time_global() };

    this.intervals.set(descriptor, true);

    return $multi(() => this.unregisterGameInterval(descriptor), descriptor, callback);
  }

  /**
   * Unregister game interval.
   *
   * @param descriptor - Descriptor of interval to stop.
   */
  public unregisterGameInterval(descriptor: IIntervalDescriptor): void {
    if (this.intervals.has(descriptor)) {
      logger.info("Unregister interval: %s", descriptor.period);
      this.intervals.delete(descriptor);
    } else {
      logger.info("Tried to unregister not existing interval");
    }
  }

  /**
   * Register game timeout to call function after some `delay` time when possible.
   * Guarantees that callback will be called only after certain period of time once.
   * Some offsets/delays may happen so actual call offset is supplied as parameter when calling delayed function.
   *
   * @param callback - Functor to call after delay.
   * @param delay - Delay time.
   * @returns Cancel, descriptor, callback.
   */
  public registerGameTimeout(
    callback: (offset: TDuration) => void,
    delay: TDuration
  ): LuaMultiReturn<[AnyCallable, ITimeoutDescriptor, AnyCallable]> {
    const now: TTimestamp = time_global();
    const descriptor: ITimeoutDescriptor = { callback, delay, last: now };

    logger.info("Register new timeout: %s %s", delay, now);

    this.timeouts.set(descriptor, true);

    return $multi(() => this.unregisterGameTimeout(descriptor), descriptor, callback);
  }

  /**
   * Unregister game timeout.
   *
   * @param descriptor - Descriptor of timeout to stop.
   */
  public unregisterGameTimeout(descriptor: ITimeoutDescriptor): void {
    if (this.timeouts.has(descriptor)) {
      logger.info("Unregister timeout: %s", descriptor.delay);
      this.timeouts.delete(descriptor);
    } else {
      logger.info("Tried to unregister not existing timeout");
    }
  }

  /**
   * On game update tick.
   * Based on actor game object - when game is paused / in menu it does not count.
   */
  public tick(): void {
    const now: TTimestamp = time_global();

    // Process intervals.
    for (const [descriptor] of this.intervals) {
      const diff: TDuration = now - descriptor.last;

      if (diff >= descriptor.period) {
        descriptor.last = now;
        descriptor.callback(diff);
      }
    }

    // Process timeouts.
    for (const [descriptor] of this.timeouts) {
      const diff: TDuration = now - descriptor.last;

      if (diff >= descriptor.delay) {
        this.timeouts.delete(descriptor);
        descriptor.callback(diff);
      }
    }
  }

  /**
   * @returns Count of active intervals.
   */
  public getIntervalsCount(): TCount {
    return table.size(this.intervals);
  }

  /**
   * @returns Count of active timeouts.
   */
  public getTimeoutsCount(): TCount {
    return table.size(this.timeouts);
  }
}
