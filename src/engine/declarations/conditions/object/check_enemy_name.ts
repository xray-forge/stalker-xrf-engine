import { GameObject } from "xray16/alias";
import { extern, LuaArray, Nillable, TName } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Check if object enemy is alive and enemy name is matching.
 *
 * Where:
 * - params - variadic list of strings to match object enemy name.
 */
extern("xr_conditions.check_enemy_name", (_: GameObject, object: GameObject, params: LuaArray<TName>): boolean => {
  const enemy: Nillable<GameObject> = registry.objects.get(object.id()).enemy;

  if (enemy && enemy.alive()) {
    const enemyName: TName = enemy.name();

    for (const [, name] of ipairs(params)) {
      if (string.find(enemyName, name)[0]) {
        return true;
      }
    }
  }

  return false;
});
