import { IConstructor, Optional } from "@/mod/lib/types";
import { disposeManager, getManagerInstance, getWeakManagerInstance } from "@/mod/scripts/core/database/managers";

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
}

/**
 * Core manager constructor.
 */
export type TAbstractCoreManagerConstructor<T extends AbstractCoreManager = AbstractCoreManager> = IConstructor<T>;
