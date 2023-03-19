import { TXR_net_processor, XR_net_packet, XR_reader } from "xray16";

import { disposeManager, getManagerInstance, getWeakManagerInstance } from "@/engine/core/database/managers";
import { abort } from "@/engine/core/utils/debug";
import { IConstructor, Optional, TDuration } from "@/engine/lib/types";

/**
 * Abstract class for core manager implementation.
 */
export abstract class AbstractCoreManager {
  /**
   * todo;
   */
  public static getInstance<T extends AbstractCoreManager>(this: IConstructor<T>, initialize: boolean = true): T {
    return getManagerInstance(this, initialize);
  }

  /**
   * todo;
   */
  public static getWeakInstance<T extends AbstractCoreManager>(this: IConstructor<T>): Optional<T> {
    return getWeakManagerInstance(this);
  }

  /**
   * todo;
   */
  public static dispose<T extends AbstractCoreManager>(this: IConstructor<T>): void {
    return disposeManager(this);
  }

  /**
   * todo;
   */
  public isDestroyed: boolean = false;

  /**
   * todo;
   */
  public initialize(): void {}

  /**
   * todo;
   */
  public destroy(): void {}

  /**
   * todo;
   */
  public update(delta: TDuration): void {
    abort("Update method is not implemented.");
  }

  /**
   * todo;
   */
  public save(packet: XR_net_packet): void {
    abort("Save method is not implemented.");
  }

  /**
   * todo;
   */
  public load(reader: TXR_net_processor): void {
    abort("Load method is not implemented.");
  }
}

/**
 * Core manager constructor.
 */
export type TAbstractCoreManagerConstructor<T extends AbstractCoreManager = AbstractCoreManager> = IConstructor<T>;
