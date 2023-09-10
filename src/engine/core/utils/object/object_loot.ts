import { level } from "xray16";

import { getPortableStoreValue, IRegistryObjectState, registry } from "@/engine/core/database";
import { IReleaseDescriptor, ReleaseBodyManager } from "@/engine/core/managers/death/ReleaseBodyManager";
import { isObjectWithValuableLoot } from "@/engine/core/utils/object/object_check";
import { isLootableItemSection } from "@/engine/core/utils/object/object_section";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { LOOTING_DEAD_OBJECT_KEY } from "@/engine/lib/constants/portable_store_keys";
import { ClientObject, LuaArray, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

/**
 * Transfer all lootable items from one object to another.
 *
 * @param from - client object to move loot from
 * @param to - client object to move loot to
 * @returns transfered objects lists
 */
export function transferLoot(from: ClientObject, to: ClientObject): LuaArray<ClientObject> {
  const list: LuaArray<ClientObject> = new LuaTable();

  from.iterate_inventory((owner, item) => {
    if (isLootableItemSection(item.section())) {
      owner.transfer_item(item, to);
      table.insert(list, item);
    }
  }, from);

  return list;
}

/**
 * todo;
 */
export function findNearestCorpseToLoot(
  object: ClientObject
): LuaMultiReturn<[ClientObject, TNumberId, Vector] | [null, null, null]> {
  const corpses: LuaArray<IReleaseDescriptor> = ReleaseBodyManager.getInstance().releaseObjectRegistry;

  let nearestCorpseDistSqr: TDistance = logicsConfig.SEARCH_CORPSE.DISTANCE_TO_SEARCH_SQR;
  let nearestCorpseVertex: Optional<TNumberId> = null;
  let nearestCorpsePosition: Optional<Vector> = null;
  let nearestCorpseObject: Optional<ClientObject> = null;

  for (const [, descriptor] of corpses) {
    const id: TNumberId = descriptor.id;
    const registryState: Optional<IRegistryObjectState> = registry.objects.get(id);
    const corpseObject: Optional<ClientObject> = registryState !== null ? registryState.object : null;

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
    [ClientObject, TNumberId, Vector]
  >;
}
