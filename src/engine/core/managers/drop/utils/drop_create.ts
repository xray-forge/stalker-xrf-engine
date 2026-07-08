import { GameObject } from "xray16/alias";
import { abort, Nillable, TCount, TProbability, TSection } from "xray16/lib";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IItemDropAmountDescriptor } from "@/engine/core/managers/drop";
import { dropConfig } from "@/engine/core/managers/drop/DropConfig";
import { filterObjectDeathLoot } from "@/engine/core/managers/drop/utils/drop_filter";
import { Stalker } from "@/engine/core/objects/creature";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { TInventoryItem } from "@/engine/lib/constants/items";

/**
 * Spawn death loot items for the object corpse based on its community drop configuration.
 *
 * @param object - Target object to create release items.
 */
export function createCorpseReleaseItems(object: GameObject): void {
  const stalker: Nillable<Stalker> = registry.simulator.object<Stalker>(object.id());

  if (!stalker || stalker.isCorpseLootDropped) {
    return;
  }

  stalker.isCorpseLootDropped = true;

  filterObjectDeathLoot(object);

  if (object.spawn_ini()?.section_exist(dropConfig.DONT_SPAWN_LOOT_LTX_SECTION)) {
    return;
  }

  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());

  if (state.ini?.line_exist(state.sectionLogic, dropConfig.DONT_SPAWN_LOOT_LTX_SECTION)) {
    return;
  }

  const spawnItems: Nillable<LuaTable<TInventoryItem, TProbability>> = dropConfig.ITEMS_BY_COMMUNITY.get(
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
 * Check whether the dependencies for dropping the provided item section are satisfied for the object.
 *
 * @param object - Object to check the item dependencies for.
 * @param section - Section of the item whose drop dependencies are checked.
 * @returns Whether the item section is allowed to drop based on its dependencies.
 */
export function checkItemDependentDrops(object: GameObject, section: TSection): boolean {
  if (!dropConfig.ITEMS_DEPENDENCIES.has(section)) {
    return true;
  }

  let isDependent: boolean = true;

  for (const [dependentSection] of dropConfig.ITEMS_DEPENDENCIES.get(section)) {
    const item: Nillable<GameObject> = object.object(dependentSection);

    if (item && !object.marked_dropped(item)) {
      return true;
    } else {
      isDependent = false;
    }
  }

  return isDependent;
}
