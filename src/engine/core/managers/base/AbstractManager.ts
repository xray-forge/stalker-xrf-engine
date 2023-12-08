import { disposeManager, getManager, getWeakManager } from "@/engine/core/database/managers";
import { abort } from "@/engine/core/utils/assertion";
import { IConstructor, NetPacket, NetProcessor, Optional, TDuration } from "@/engine/lib/types";

/**
 * Abstract class for core manager implementation.
 */
export abstract class AbstractManager {
  /**
   * Get singleton manager instance from managers registry.
   * Initialize manager if it was not initialized before.
   *
   * @returns manager instance
   */
  public static getInstance<T extends AbstractManager>(this: IConstructor<T>): T {
    return getManager(this);
  }

  /**
   * Get singleton manager instance if it exists.
   * Do not initialize manager if it was not registered before.
   *
   * @returns manager instance or `null`
   */
  public static getWeakInstance<T extends AbstractManager>(this: IConstructor<T>): Optional<T> {
    return getWeakManager(this);
  }

  /**
   * Dispose manager instance if it is registered.
   */
  public static dispose<T extends AbstractManager>(this: IConstructor<T>): void {
    return disposeManager(this);
  }

  /**
   * Whether manager was disposed and removed from registry.
   */
  public isDestroyed: boolean = false;

  /**
   * Manager initialized and registered callback.
   */
  public initialize(): void {}

  /**
   * Manager destroyed and removed from registry callback.
   */
  public destroy(): void {}

  /**
   * Generic method for game update tick
   *
   * @param delta - delta from previous update
   */
  public update(delta: TDuration): void {
    abort("Update method is not implemented.");
  }

  /**
   * Generic base method for saving.
   *
   * @param packet - net packet to write data
   */
  public save(packet: NetPacket): void {
    abort("Save method is not implemented.");
  }

  /**
   * Generic base method for loading.
   *
   * @param reader - net processor to read data from
   */
  public load(reader: NetProcessor): void {
    abort("Load method is not implemented.");
  }
}

/**
 * Core manager constructor.
 */
export type TAbstractCoreManagerConstructor<T extends AbstractManager = AbstractManager> = IConstructor<T>;
