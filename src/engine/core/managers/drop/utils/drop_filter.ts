import { registry } from "@/engine/core/database";
import { dropConfig } from "@/engine/core/managers/drop/DropConfig";
import { isArtefact, isGrenade, isWeapon } from "@/engine/core/utils/class_ids";
import { setItemCondition } from "@/engine/core/utils/item";
import { isAmmoSection, isExcludedFromLootDropItemSection, isLootableItemSection } from "@/engine/core/utils/section";
import { misc } from "@/engine/lib/constants/items/misc";
import { AlifeSimulator, GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

/**
 * Iterate over object inventory and release items
 *
 * @param object - game object to filter inventory items after death
 */
export function filterObjectDeathLoot(object: GameObject): void {
  const simulator: AlifeSimulator = registry.simulator;
  const ini: Optional<IniFile> = object.spawn_ini();

  // Object is marked as excluded from filtering.
  // todo: Check jub_b10_drunk and remove if it is not needed.
  if (ini && ini.section_exist("keep_items")) {
    return;
  }

  object.iterate_inventory((object: GameObject, item: GameObject): void => {
    if (shouldFilterLootItem(item)) {
      simulator.release(simulator.object(item.id()), true);
    } else {
      // Apply weapon post-death drop degradation.
      if (isWeapon(item) && !isGrenade(item)) {
        setItemCondition(
          item,
          math.random(dropConfig.DROPPED_WEAPON_STATE_DEGRADATION.MIN, dropConfig.DROPPED_WEAPON_STATE_DEGRADATION.MAX)
        );
      }
    }
  }, object);
}

/**
 * Filter object item and verify that it can be dropped.
 *
 * @param item - item game object to check availability in drop
 * @returns whether provided item should be filtered from loot
 */
export function shouldFilterLootItem(item: GameObject): boolean {
  const section: TSection = item.section();

  if (isExcludedFromLootDropItemSection(section)) {
    return true;
  }

  if (section === misc.bolt) {
    return false;
  }

  if (dropConfig.ITEMS_KEEP.has(section)) {
    return false;
  }

  if (isArtefact(item)) {
    return false;
  }

  if (isWeapon(item)) {
    return false;
  }

  if (isLootableItemSection(section) && !isAmmoSection(section)) {
    return false;
  }

  return true;
}
