import { IConstructor } from "@/mod/lib/types";
import { getManagerInstance } from "@/mod/scripts/core/db/ManagersRegistry";

/**
 * Abstract class for core manager implementation.
 */
export abstract class AbstractCoreManager {
  public static getInstance<T extends AbstractCoreManager>(this: IConstructor<T>): T {
    return getManagerInstance(this);
  }

  public isDestroyed: boolean = false;

  public destroy(): void {}
}

/**
 * Core manager constructor.
 */
export type TAbstractCoreManagerConstructor<T extends AbstractCoreManager = AbstractCoreManager> = IConstructor<T>;
