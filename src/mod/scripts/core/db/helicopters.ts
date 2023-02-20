import { XR_game_object } from "xray16";

import { addObject, deleteObject } from "@/mod/scripts/core/db/objects";
import { registry } from "@/mod/scripts/core/db/registry";

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
  addObject(object);
  registry.helicopter.storage.set(object.id(), object);
}

/**
 * todo;
 */
export function deleteHelicopter(object: XR_game_object): void {
  deleteObject(object);
  registry.helicopter.storage.delete(object.id());
}
