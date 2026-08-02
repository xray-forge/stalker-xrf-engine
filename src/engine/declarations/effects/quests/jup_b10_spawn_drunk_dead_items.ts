import { GameObject, ServerObject } from "xray16/alias";
import { abort, ACTOR_ID, createEmptyVector, extern, Nillable, TCount, TNumberId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { TInventoryItem } from "@/engine/constants/items";
import { ammo } from "@/engine/constants/items/ammo";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { getObjectIdByStoryId, getPortableStoreValue, registry } from "@/engine/core/database";

/**
 * Spawn the Jupiter b10 drunk dead loot set, either into a target box by counter or onto the object.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object that receives the loot when no target story ID is provided.
 * @param params - Tuple containing the Nillable target box story ID.
 */
extern("xr_effects.jup_b10_spawn_drunk_dead_items", (actor: GameObject, object: GameObject, params: [string]): void => {
  const itemsAll: Array<[TInventoryItem, TCount]> = [
    [weapons.wpn_ak74, 1],
    [weapons.wpn_fort, 1],
    [ammo["ammo_5.45x39_fmj"], 5],
    [ammo["ammo_5.45x39_ap"], 3],
    [ammo.ammo_9x18_fmj, 3],
    [ammo.ammo_12x70_buck, 5],
    [ammo["ammo_11.43x23_hydro"], 2],
    [weapons.grenade_rgd5, 3],
    [weapons.grenade_f1, 2],
    [drugs.medkit_army, 2],
    [drugs.medkit, 4],
    [drugs.bandage, 4],
    [drugs.antirad, 2],
    [food.vodka, 3],
    [food.energy_drink, 2],
    [food.conserva, 1],
    [questItems.jup_b10_ufo_memory_2, 1],
  ];

  const items: Array<Array<[TInventoryItem, TCount]>> = [
    [
      [drugs.medkit_army, 2],
      [drugs.medkit, 4],
      [drugs.bandage, 4],
      [drugs.antirad, 2],
      [food.vodka, 3],
      [food.energy_drink, 2],
      [food.conserva, 1],
    ],
    [
      [ammo["ammo_5.45x39_fmj"], 5],
      [ammo["ammo_5.45x39_ap"], 3],
      [weapons.wpn_fort, 1],
      [ammo.ammo_9x18_fmj, 3],
      [ammo.ammo_12x70_buck, 5],
      [ammo["ammo_11.43x23_hydro"], 2],
      [weapons.grenade_rgd5, 3],
      [weapons.grenade_f1, 2],
    ],
    [[weapons.wpn_sig550_luckygun, 1]],
  ];

  if (params && $isNotNil(params[0])) {
    const cnt: TCount = getPortableStoreValue(ACTOR_ID, "jup_b10_ufo_counter", 0);

    if (cnt > 2) {
      return;
    }

    for (const [k, v] of items[cnt]) {
      const targetObjectId: Nillable<TNumberId> = getObjectIdByStoryId(params[0]);

      if ($isNotNil(targetObjectId)) {
        const box: Nillable<ServerObject> = registry.simulator.object(targetObjectId);

        if ($isNil(box)) {
          abort("There is no such object %s", params[0]);
        }

        for (const i of $range(1, v)) {
          registry.simulator.create(k, createEmptyVector(), 0, 0, targetObjectId);
        }
      } else {
        abort("object is null %s", tostring(params[0]));
      }
    }
  } else {
    for (const [k, v] of itemsAll) {
      for (const i of $range(1, v)) {
        registry.simulator.create(k, object.position(), object.level_vertex_id(), object.game_vertex_id(), object.id());
      }
    }
  }
});
