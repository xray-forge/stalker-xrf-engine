import { GameObject } from "xray16/alias";
import { TIndex } from "xray16/lib";

import { HelicopterBinder } from "@/engine/core/binders/helicopter/HelicopterBinder";
import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";

/**
 * Register helicopter binder object.
 *
 * @param helicopter - Helicopter binder object to register.
 * @returns Registry state for provided object.
 */
export function registerHelicopter(helicopter: HelicopterBinder): IRegistryObjectState {
  registry.helicopter.storage.set(helicopter.object.id(), helicopter.object);

  return registerObject(helicopter.object);
}

/**
 * Unregister helicopter binder object.
 *
 * @param helicopter - Helicopter binder object to unregister.
 */
export function unregisterHelicopter(helicopter: HelicopterBinder): void {
  return unregisterHelicopterObject(helicopter.object);
}

/**
 * Unregister helicopter object.
 *
 * @param object - Helicopter game object to unregister.
 */
export function unregisterHelicopterObject(object: GameObject): void {
  unregisterObject(object);
  registry.helicopter.storage.delete(object.id());
}

/**
 * Remove helicopter from the helicopters list, keeping the underlying object registered.
 *
 * @param object - Helicopter game object to remove from the helicopters list.
 */
export function unregisterHelicopterFromList(object: GameObject): void {
  registry.helicopter.storage.delete(object.id());
}

/**
 * Register object as enemy for helicopters.
 *
 * @param object - Object to register as enemy.
 * @returns Index of newly added enemy.
 */
export function registerHelicopterEnemy(object: GameObject): TIndex {
  const index: TIndex = registry.helicopter.enemyIndex;

  registry.helicopter.enemies.set(index, object);
  registry.helicopter.enemyIndex = index + 1;

  return index;
}

/**
 * Unregister enemy from registry.
 *
 * @param enemyIndex - Index of enemy to remove.
 */
export function unregisterHelicopterEnemy(enemyIndex: TIndex): void {
  registry.helicopter.enemies.delete(enemyIndex);
}
