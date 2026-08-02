import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern, Nillable, TName, TNumberId } from "xray16/lib";

import { registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getObjectTerrain } from "@/engine/core/utils/position";

/**
 * Check if object enemy is currently in smart terrain with provided name.
 *
 * Where:
 * - terrainName - smart terrain of enemy to expect with condition check.
 */
extern("xr_conditions.check_enemy_smart", (_: GameObject, object: GameObject, [terrainName]: [TName]): boolean => {
  const enemyId: Nillable<TNumberId> = registry.objects.get(object.id()).enemyId;
  const enemy: Nillable<GameObject> = enemyId ? registry.objects.get(enemyId)?.object : null;

  if (enemyId === ACTOR_ID || !enemy) {
    return false;
  }

  const enemyTerrain: Nillable<SmartTerrain> = getObjectTerrain(enemy);

  return enemyTerrain ? enemyTerrain.name() === terrainName : false;
});
