import { level } from "xray16";

import { getPortableStoreValue, IRegistryObjectState, registry } from "@/engine/core/database";
import { deathConfig } from "@/engine/core/managers/death/DeathConfig";
import { corpseDetectionConfig } from "@/engine/core/schemes/stalker/corpse_detection/CorpseDetectionConfig";
import { isLootableItemSection } from "@/engine/core/utils/section";
import { lootableTable } from "@/engine/lib/constants/items/lootable_table";
import { LOOTING_DEAD_OBJECT_KEY } from "@/engine/lib/constants/portable_store_keys";
import { GameObject, LuaArray, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

/**
 * Check if object has valuable loot.
 *
 * @param object - game object to check
 * @returns whether object has any valuables to loot
 */
export function isObjectWithValuableLoot(object: GameObject): boolean {
  let hasValuableLoot: boolean = false;

  object.iterate_inventory((object: GameObject, item: GameObject) => {
    if (item.section() in lootableTable) {
      hasValuableLoot = true;

      // Stop iterations, one is enough.
      return true;
    }
  }, object);

  return hasValuableLoot;
}

/**
 * Transfer all lootable items from one object to another.
 *
 * @param from - game object to move loot from
 * @param to - game object to move loot to
 * @returns transfered objects lists
 */
export function transferLoot(from: GameObject, to: GameObject): LuaArray<GameObject> {
  const list: LuaArray<GameObject> = new LuaTable();

  from.iterate_inventory((owner, item) => {
    if (isLootableItemSection(item.section())) {
      owner.transfer_item(item, to);
      table.insert(list, item);
    }
  }, from);

  return list;
}

/**
 * Get nearest corpse for game object.
 *
 * @param object - game object to get nearest corpse
 * @returns tuple with object, vertex id, position
 */
export function getNearestCorpseToLoot(
  object: GameObject
): LuaMultiReturn<[GameObject, TNumberId, Vector] | [null, null, null]> {
  let nearestCorpseDistSqr: TDistance = corpseDetectionConfig.DISTANCE_TO_SEARCH_SQR;
  let nearestCorpseVertex: Optional<TNumberId> = null;
  let nearestCorpsePosition: Optional<Vector> = null;
  let nearestCorpseObject: Optional<GameObject> = null;

  for (const [, descriptor] of deathConfig.RELEASE_OBJECTS_REGISTRY) {
    const id: TNumberId = descriptor.id;
    const registryState: Optional<IRegistryObjectState> = registry.objects.get(id);
    const corpseObject: Optional<GameObject> = registryState !== null ? registryState.object : null;

    // Is registered in client side.
    if (corpseObject) {
      const isLootedBy: Optional<TNumberId> = getPortableStoreValue(id, LOOTING_DEAD_OBJECT_KEY);

      if (
        // Is not looted by anyone or looted by current object.
        (isLootedBy === null || isLootedBy === object.id()) &&
        // Seen dead object recently.
        object.memory_position(corpseObject) !== null &&
        isObjectWithValuableLoot(corpseObject)
      ) {
        const distanceBetween: TDistance = object.position().distance_to_sqr(corpseObject.position());

        // Is near enough and has valuable loot.
        if (distanceBetween < nearestCorpseDistSqr) {
          const corpseVertex: TNumberId = level.vertex_id(corpseObject.position());

          // Can be reached by object.
          if (object.accessible(corpseVertex)) {
            nearestCorpseDistSqr = distanceBetween;
            nearestCorpseVertex = corpseVertex;
            nearestCorpsePosition = corpseObject.position();
            nearestCorpseObject = corpseObject;
          }
        }
      }
    }
  }

  return $multi(nearestCorpseObject, nearestCorpseVertex, nearestCorpsePosition) as LuaMultiReturn<
    [GameObject, TNumberId, Vector]
  >;
}
