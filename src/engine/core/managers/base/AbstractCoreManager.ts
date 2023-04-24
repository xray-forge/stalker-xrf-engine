import { TXR_net_processor, XR_net_packet } from "xray16";

import { disposeManager, getManagerInstance, getWeakManagerInstance } from "@/engine/core/database/managers";
import { abort } from "@/engine/core/utils/assertion";
import { IConstructor, Optional, TDuration } from "@/engine/lib/types";

/**
 * Abstract class for core manager implementation.
 */
export abstract class AbstractCoreManager {
  /**
   * Get singleton manager instance from managers registry.
   * Initialize manager if it was not initialized before.
   *
   * @param initialize - whether initialize should be called on manager instance creation, `true` by default
   * @returns manager instance
   */
  public static getInstance<T extends AbstractCoreManager>(this: IConstructor<T>, initialize: boolean = true): T {
    return getManagerInstance(this, initialize);
  }

  /**
   * todo: Description.
   */
  public static getWeakInstance<T extends AbstractCoreManager>(this: IConstructor<T>): Optional<T> {
    return getWeakManagerInstance(this);
  }

  /**
   * todo: Description.
   */
  public static dispose<T extends AbstractCoreManager>(this: IConstructor<T>): void {
    return disposeManager(this);
  }

  /**
   * todo: Description.
   */
  public isDestroyed: boolean = false;

  /**
   * todo: Description.
   */
  public initialize(): void {}

  /**
   * todo: Description.
   */
  public destroy(): void {}

  /**
   * todo: Description.
   */
  public update(delta: TDuration): void {
    abort("Update method is not implemented.");
  }

  /**
   * Generic base method for saving.
   *
   * @param packet - net packet to write data
   */
  public save(packet: XR_net_packet): void {
    abort("Save method is not implemented.");
  }

  /**
   * Generic base method for loading.
   *
   * @param reader - net processor to read data from
   */
  public load(reader: TXR_net_processor): void {
    abort("Load method is not implemented.");
  }
}

/**
 * Core manager constructor.
 */
export type TAbstractCoreManagerConstructor<T extends AbstractCoreManager = AbstractCoreManager> = IConstructor<T>;
