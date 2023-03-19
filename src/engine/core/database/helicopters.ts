import { XR_game_object } from "xray16";

import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { TIndex } from "@/engine/lib/types";

/**
 * todo;
 */
export function registerHelicopterEnemy(object: XR_game_object): void {
  registry.helicopter.enemies.set(registry.helicopter.enemiesCount, object);
  registry.helicopter.enemiesCount += 1;
}

/**
 * todo;
 */
export function unregisterHelicopterEnemy(enemyIndex: TIndex): void {
  registry.helicopter.enemies.delete(enemyIndex);
}

/**
 * todo;
 */
export function registerHelicopter(object: XR_game_object): void {
  registerObject(object);
  registry.helicopter.storage.set(object.id(), object);
}

/**
 * todo;
 */
export function unregisterHelicopter(object: XR_game_object): void {
  unregisterObject(object);
  registry.helicopter.storage.delete(object.id());
}
