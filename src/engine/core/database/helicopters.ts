import { XR_game_object } from "xray16";

import { IRegistryObjectState, registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { HelicopterBinder } from "@/engine/core/objects";
import { TIndex } from "@/engine/lib/types";

/**
 * Register helicopter binder object.
 */
export function registerHelicopter(helicopter: HelicopterBinder): IRegistryObjectState {
  registry.helicopter.storage.set(helicopter.object.id(), helicopter.object);

  return registerObject(helicopter.object);
}

/**
 * Unregister helicopter binder object.
 */
export function unregisterHelicopter(helicopter: HelicopterBinder): void {
  unregisterObject(helicopter.object);
  registry.helicopter.storage.delete(helicopter.object.id());
}

/**
 * Register object as enemy for helicopters.
 *
 * @param object - object to register as enemy
 * @returns index of newly added enemy
 */
export function registerHelicopterEnemy(object: XR_game_object): TIndex {
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
