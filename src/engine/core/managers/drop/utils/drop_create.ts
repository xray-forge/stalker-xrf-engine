import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IItemDropAmountDescriptor } from "@/engine/core/managers/drop";
import { dropConfig } from "@/engine/core/managers/drop/DropConfig";
import { filterObjectDeathLoot } from "@/engine/core/managers/drop/utils/drop_filter";
import { Stalker } from "@/engine/core/objects/creature";
import { abort } from "@/engine/core/utils/assertion";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { GameObject, Optional, TCount, TProbability, TSection } from "@/engine/lib/types";

/**
 * todo;
 *
 * @param object - target object to create release items.
 */
export function createCorpseReleaseItems(object: GameObject): void {
  const stalker: Optional<Stalker> = registry.simulator.object<Stalker>(object.id());

  if (stalker === null || stalker.isCorpseLootDropped) {
    return;
  }

  stalker.isCorpseLootDropped = true;

  filterObjectDeathLoot(object);

  if (object.spawn_ini()?.section_exist(dropConfig.DONT_SPAWN_LOOT_LTX_SECTION)) {
    return;
  }

  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  if (state.ini?.line_exist(state.sectionLogic, dropConfig.DONT_SPAWN_LOOT_LTX_SECTION)) {
    return;
  }

  const spawnItems: Optional<LuaTable<TInventoryItem, TProbability>> = dropConfig.ITEMS_BY_COMMUNITY.get(
    getObjectCommunity(object)
  );

  if (!spawnItems) {
    return;
  }

  // Spawn dependent items (ammo etc) and corpse loot.
  for (const [section, probability] of spawnItems) {
    if (checkItemDependentDrops(object, section)) {
      if (!dropConfig.ITEMS_DROP_COUNT_BY_LEVEL.has(section)) {
        abort("Incorrect count settings in DropManager for object [%s].", section);
      }

      const limits: IItemDropAmountDescriptor = dropConfig.ITEMS_DROP_COUNT_BY_LEVEL.get(section);
      const count: TCount = math.ceil(math.random(limits.min, limits.max));

      if (count > 0 && probability > 0) {
        spawnItemsForObject(object, section, count, probability);
      }
    }
  }
}

/**
 * todo: Description.
 */
export function checkItemDependentDrops(object: GameObject, section: TSection): boolean {
  if (!dropConfig.ITEMS_DEPENDENCIES.has(section)) {
    return true;
  }

  let isDependent: boolean = true;

  for (const [dependentSection] of dropConfig.ITEMS_DEPENDENCIES.get(section)) {
    const item: Optional<GameObject> = object.object(dependentSection);

    if (item && !object.marked_dropped(item)) {
      return true;
    } else {
      isDependent = false;
    }
  }

  return isDependent;
}
