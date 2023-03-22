import { TXR_net_processor, XR_net_packet, XR_reader } from "xray16";

import { disposeManager, getManagerInstance, getWeakManagerInstance } from "@/engine/core/database/managers";
import { abort } from "@/engine/core/utils/assertion";
import { IConstructor, Optional, TDuration } from "@/engine/lib/types";

/**
 * Abstract class for core manager implementation.
 */
export abstract class AbstractCoreManager {
  /**
   * todo: Description.
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
   * todo: Description.
   */
  public save(packet: XR_net_packet): void {
    abort("Save method is not implemented.");
  }

  /**
   * todo: Description.
   */
  public load(reader: TXR_net_processor): void {
    abort("Load method is not implemented.");
  }
}

/**
 * Core manager constructor.
 */
export type TAbstractCoreManagerConstructor<T extends AbstractCoreManager = AbstractCoreManager> = IConstructor<T>;
