import { XR_game_object } from "xray16";

import { registerObject, unregisterObject } from "@/mod/scripts/core/database/objects";
import { registry } from "@/mod/scripts/core/database/registry";

/**
 * todo;
 */
export function addHelicopterEnemy(object: XR_game_object): void {
  registry.helicopter.enemies.set(registry.helicopter.enemiesCount, object);
  registry.helicopter.enemiesCount += 1;
}

/**
 * todo;
 */
export function deleteHelicopterEnemy(enemyIndex: number): void {
  registry.helicopter.enemies.delete(enemyIndex);
}

/**
 * todo;
 */
export function addHelicopter(object: XR_game_object): void {
  registerObject(object);
  registry.helicopter.storage.set(object.id(), object);
}

/**
 * todo;
 */
export function deleteHelicopter(object: XR_game_object): void {
  unregisterObject(object);
  registry.helicopter.storage.delete(object.id());
}
