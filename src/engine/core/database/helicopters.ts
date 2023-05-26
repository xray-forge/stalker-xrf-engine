import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { HelicopterBinder } from "@/engine/core/objects";
import { ClientGameObject, TIndex } from "@/engine/lib/types";

/**
 * Register helicopter binder object.
 *
 * @param helicopter - helicopter binder object to register
 * @returns registry state for provided object
 */
export function registerHelicopter(helicopter: HelicopterBinder): IRegistryObjectState {
  registry.helicopter.storage.set(helicopter.object.id(), helicopter.object);

  return registerObject(helicopter.object);
}

/**
 * Unregister helicopter binder object.
 *
 * @param helicopter - helicopter binder object to unregister
 */
export function unregisterHelicopter(helicopter: HelicopterBinder): void {
  return unregisterHelicopterObject(helicopter.object);
}

/**
 * Unregister helicopter object.
 *
 * @param object - helicopter client object to unregister
 */
export function unregisterHelicopterObject(object: ClientGameObject): void {
  unregisterObject(object);
  registry.helicopter.storage.delete(object.id());
}

/**
 * Register object as enemy for helicopters.
 *
 * @param object - object to register as enemy
 * @returns index of newly added enemy
 */
export function registerHelicopterEnemy(object: ClientGameObject): TIndex {
  const index: TIndex = registry.helicopter.enemyIndex;

  registry.helicopter.enemies.set(index, object);
  registry.helicopter.enemyIndex = index + 1;

  return index;
}

/**
 * Unregister enemy from registry.
 *
 * @param enemyIndex - index of enemy to remove
 */
export function unregisterHelicopterEnemy(enemyIndex: TIndex): void {
  registry.helicopter.enemies.delete(enemyIndex);
}
