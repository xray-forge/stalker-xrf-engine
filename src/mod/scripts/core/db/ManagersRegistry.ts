import { Optional } from "@/mod/lib/types";
import { AbstractCoreManager, TAbstractCoreManagerConstructor } from "@/mod/scripts/core/AbstractCoreManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ManagersRegistry");

const managersRegistry: LuaTable<TAbstractCoreManagerConstructor, AbstractCoreManager> = new LuaTable();

/**
 * Get initialized manager singleton.
 */
export function getManagerInstance<T extends TAbstractCoreManagerConstructor>(it: T): InstanceType<T> {
  if (!managersRegistry.get(it)) {
    log.info("Initialize manager:", it.name);

    const instance: AbstractCoreManager = new it();

    managersRegistry.set(it, instance);

    return instance as InstanceType<T>;
  }

  return managersRegistry.get(it) as InstanceType<T>;
}

/**
 * Get manager instance without init gate.
 */
export function getWeakManagerInstance<T extends TAbstractCoreManagerConstructor>(it: T): Optional<InstanceType<T>> {
  return managersRegistry.get(it) as InstanceType<T>;
}

/**
 * Check whether manager instance is already initialized.
 */
export function isManagerInitialized<T extends TAbstractCoreManagerConstructor>(it: T): boolean {
  return managersRegistry.has(it);
}

/**
 * Destroy and remove manager from registry.
 */
export function destroyManager<T extends TAbstractCoreManagerConstructor>(it: T, force?: boolean): void {
  const manager: Optional<AbstractCoreManager> = managersRegistry.get(it);

  if (manager !== null) {
    log.info("Destroy manager:", it.name);

    manager.destroy();
    manager.isDestroyed = true;

    managersRegistry.delete(it);
  } else if (!force) {
    log.warn("Manager already destroyed:", it.name);
  }
}
