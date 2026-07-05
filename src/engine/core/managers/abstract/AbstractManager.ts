import { NetPacket, NetProcessor } from "xray16/alias";

import { abort } from "@/engine/core/utils/assertion";
import { IConstructor, TDuration } from "@/engine/lib/types";

/**
 * Abstract class for core manager implementation.
 */
export abstract class AbstractManager {
  // Whether manager was disposed and removed from registry, disposed manager are not supposed to work.
  // Mainly for timers / async or delayed code.
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
   * @param delta - Delta time since previous update.
   */
  public update(delta: TDuration): void {
    abort("Update method is not implemented.");
  }

  /**
   * @param packet - Net packet to write data.
   */
  public save(packet: NetPacket): void {
    abort("Save method is not implemented.");
  }

  /**
   * @param reader - Net processor to read data from.
   */
  public load(reader: NetProcessor): void {
    abort("Load method is not implemented.");
  }
}

/**
 * Core manager constructor.
 */
export type TAbstractCoreManagerConstructor<T extends AbstractManager = AbstractManager> = IConstructor<T>;
