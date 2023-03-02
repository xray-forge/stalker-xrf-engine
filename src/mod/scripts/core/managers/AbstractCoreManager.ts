import { IConstructor } from "@/mod/lib/types";
import { getManagerInstance } from "@/mod/scripts/core/database/managers";

/**
 * Abstract class for core manager implementation.
 */
export abstract class AbstractCoreManager {
  public static getInstance<T extends AbstractCoreManager>(this: IConstructor<T>, initialize: boolean = true): T {
    return getManagerInstance(this, initialize);
  }

  public isDestroyed: boolean = false;

  public initialize(): void {}

  public destroy(): void {}
}

/**
 * Core manager constructor.
 */
export type TAbstractCoreManagerConstructor<T extends AbstractCoreManager = AbstractCoreManager> = IConstructor<T>;
