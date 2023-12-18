import { registry } from "@/engine/core/database/registry";
import type { AbstractManager, TAbstractCoreManagerConstructor } from "@/engine/core/managers/abstract";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Get initialized manager singleton.
 *
 * @param ManagerClass - manager class statics reference, used as key in registry to get singletons
 * @returns manager instance singleton
 */
export function getManager<T extends TAbstractCoreManagerConstructor>(ManagerClass: T): InstanceType<T> {
  return (registry.managers.get(ManagerClass) ?? initializeManager(ManagerClass)) as InstanceType<T>;
}

/**
 * Get initialized manager singleton or `null` by name.
 * Used mainly in cases when circular reference appears.
 * Do not use it until you know what exactly you are doing.
 *
 * Note: cannot initialize instance automatically because ref does not exist with name only
 *
 * @param name - manager class name to get
 * @returns manager instance singleton or null if it is not initialized
 */
export function getManagerByName<T extends AbstractManager>(name: TName): Optional<T> {
  return registry.managersByName.get(name) as Optional<T>;
}

/**
 * Get manager instance without initialization if it does not exist.
 *
 * @param ManagerClass - manager class statics reference, used as key in registry to get singletons
 * @returns manager singleton if it is initialized, 'null' otherwise
 */
export function getWeakManager<T extends TAbstractCoreManagerConstructor>(ManagerClass: T): Optional<InstanceType<T>> {
  return registry.managers.get(ManagerClass) as InstanceType<T>;
}

/**
 * Check whether manager instance is already initialized.
 *
 * @param ManagerClass - manager class statics reference, used as key in registry to get singletons
 * @returns whether manager class singleton is initialized and stored in registry
 */
export function isManagerInitialized<T extends TAbstractCoreManagerConstructor>(ManagerClass: T): boolean {
  return registry.managers.has(ManagerClass);
}

/**
 * Initialize manager instance in registry, if it is not present.
 *
 * @param ManagerClass - manager class statics reference, used as key in registry to get singletons
 */
export function initializeManager<T extends TAbstractCoreManagerConstructor>(
  ManagerClass: TAbstractCoreManagerConstructor
): InstanceType<T> {
  let manager: Optional<AbstractManager> = registry.managers.get(ManagerClass);

  if (!manager) {
    logger.format("Initialize manager: %s", ManagerClass.name);

    manager = new ManagerClass();

    registry.managers.set(ManagerClass, manager);
    registry.managersByName.set(ManagerClass.name, manager);

    manager.initialize();
  }

  return manager as InstanceType<T>;
}

/**
 * Destroy and remove manager from registry.
 *
 * @param ManagerClass - manager class statics reference, used as key in registry to get singletons
 */
export function disposeManager<T extends TAbstractCoreManagerConstructor>(ManagerClass: T): void {
  const manager: Optional<AbstractManager> = registry.managers.get(ManagerClass) as Optional<AbstractManager>;

  if (manager) {
    logger.format("Dispose manager: %s", ManagerClass.name);

    manager.destroy();
    manager.isDestroyed = true;

    registry.managers.delete(ManagerClass);
    registry.managersByName.delete(ManagerClass.name);
  }
}

/**
 * Destroy and remove all managers from registry to clean up scope.
 * Each manager lifecycle methods are expected to be called in the process.
 */
export function disposeManagers(): void {
  for (const [ManagerClass] of registry.managers) {
    disposeManager(ManagerClass);
  }
}
