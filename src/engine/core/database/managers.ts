import { registry } from "@/engine/core/database/registry";
import type { AbstractCoreManager, TAbstractCoreManagerConstructor } from "@/engine/core/managers/AbstractCoreManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Get initialized manager singleton.
 *
 * @param managerClass - manager class statics reference, used as key in registry to get singletons
 * @param initialize - whether initialization lifecycle should be called, 'true' by default
 * @returns manager instance singleton
 */
export function getManagerInstance<T extends TAbstractCoreManagerConstructor>(
  managerClass: T,
  initialize: boolean = true
): InstanceType<T> {
  if (!registry.managers.get(managerClass)) {
    logger.info("Initialize manager:", managerClass.name);

    const instance: AbstractCoreManager = new managerClass();

    registry.managers.set(managerClass, instance);

    if (initialize) {
      instance.initialize();
    }

    return instance as InstanceType<T>;
  }

  return registry.managers.get(managerClass) as InstanceType<T>;
}

/**
 * Get manager instance without initialization if it does not exist.
 *
 * @param managerClass - manager class statics reference, used as key in registry to get singletons
 * @returns manager singleton if it is initialized, 'null' otherwise
 */
export function getWeakManagerInstance<T extends TAbstractCoreManagerConstructor>(
  managerClass: T
): Optional<InstanceType<T>> {
  return registry.managers.get(managerClass) as InstanceType<T>;
}

/**
 * Check whether manager instance is already initialized.
 *
 * @param managerClass - manager class statics reference, used as key in registry to get singletons
 * @returns whether manager class singleton is initialized and stored in registry
 */
export function isManagerInitialized<T extends TAbstractCoreManagerConstructor>(managerClass: T): boolean {
  return registry.managers.has(managerClass);
}

/**
 * Destroy and remove manager from registry.
 *
 * @param managerClass - manager class statics reference, used as key in registry to get singletons
 */
export function disposeManager<T extends TAbstractCoreManagerConstructor>(managerClass: T): void {
  const manager: Optional<AbstractCoreManager> = registry.managers.get(managerClass);

  if (manager !== null) {
    logger.info("Dispose manager:", managerClass.name);

    manager.destroy();
    manager.isDestroyed = true;

    registry.managers.delete(managerClass);
  }
}

/**
 * Destroy and remove all managers from registry to clean up scope.
 * Each manager lifecycle methods are expected to be called in the process.
 */
export function disposeManagers(): void {
  logger.info("Dispose existing managers:", registry.managers.length());

  for (const [implementation] of registry.managers) {
    disposeManager(implementation);
  }
}