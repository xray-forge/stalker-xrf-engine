import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database/registry";
import type {
  AbstractCoreManager,
  TAbstractCoreManagerConstructor,
} from "@/mod/scripts/core/managers/AbstractCoreManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("managers");

/**
 * Get initialized manager singleton.
 */
export function getManagerInstance<T extends TAbstractCoreManagerConstructor>(
  it: T,
  initialize: boolean = true
): InstanceType<T> {
  if (!registry.managers.get(it)) {
    logger.info("Initialize manager:", it.name);

    const instance: AbstractCoreManager = new it();

    registry.managers.set(it, instance);

    if (initialize) {
      instance.initialize();
    }

    return instance as InstanceType<T>;
  }

  return registry.managers.get(it) as InstanceType<T>;
}

/**
 * Get manager instance without init gate.
 */
export function getWeakManagerInstance<T extends TAbstractCoreManagerConstructor>(it: T): Optional<InstanceType<T>> {
  return registry.managers.get(it) as InstanceType<T>;
}

/**
 * Check whether manager instance is already initialized.
 */
export function isManagerInitialized<T extends TAbstractCoreManagerConstructor>(it: T): boolean {
  return registry.managers.has(it);
}

/**
 * Destroy and remove manager from registry.
 */
export function destroyManager<T extends TAbstractCoreManagerConstructor>(it: T, force?: boolean): void {
  const manager: Optional<AbstractCoreManager> = registry.managers.get(it);

  if (manager !== null) {
    logger.info("Destroy manager:", it.name);

    manager.destroy();
    manager.isDestroyed = true;

    registry.managers.delete(it);
  } else if (!force) {
    logger.warn("Manager already destroyed:", it.name);
  }
}
