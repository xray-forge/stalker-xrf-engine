import { registry, SYSTEM_INI } from "@/engine/core/database";
import { medkits, TMedkit } from "@/engine/lib/constants/items/drugs";
import { pistols } from "@/engine/lib/constants/items/weapons";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { GameObject, LuaArray, Optional, ServerObject, TCount, TNumberId, TRate, TSection } from "@/engine/lib/types";

/**
 * @param section - item section to get cost for
 * @returns cost of the item by section
 */
export function getItemPrice(section: TSection): TCount {
  return SYSTEM_INI.r_u32(section, "cost");
}

/**
 * @param id - item object id to get owner
 * @returns id of item owner or null
 */
export function getItemOwnerId(id: TNumberId): Optional<TNumberId> {
  const serverObject: Optional<ServerObject> = registry.simulator.object(id);

  if (serverObject && serverObject.parent_id !== MAX_ALIFE_ID) {
    return serverObject.parent_id;
  }

  return null;
}

/**
 * @param object - target object to get pistol from
 * @returns pistol from object inventory
 */
export function getAnyObjectPistol(object: GameObject): Optional<GameObject> {
  let pistol: Optional<GameObject> = null;

  object.iterate_inventory((owner, item) => {
    if (item.section() in pistols) {
      pistol = item;

      return true;
    }
  }, object);

  return pistol;
}

/**
 * Get available medkit or null.
 *
 * @param list - list of medical kits to check in inventory
 * @param actor - target object to get medkit, gets actor from registry by default
 * @returns get medkit or null
 */
export function getActorAvailableMedKit(
  list: LuaArray<TSection | TNumberId> = $fromObject(medkits) as unknown as LuaArray<TSection | TNumberId>,
  actor: GameObject = registry.actor
): Optional<TMedkit> {
  for (const [, medkit] of list) {
    if (actor.object(medkit) !== null) {
      return medkit as TMedkit;
    }
  }

  return null;
}

/**
 * Set item condition.
 *
 * @param object - game object to change condition
 * @param condition - value from 0 to 100, percents
 */
export function setItemCondition(object: GameObject, condition: TRate): void {
  object.set_condition(condition / 100);
}

/**
 * Check whether actor has at least one med kit.
 *
 * @param list - list of medical kits to check in inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has at least one med kit
 */
export function actorHasMedKit(
  list: LuaArray<TSection | TNumberId> = medkits as unknown as LuaArray<TSection | TNumberId>,
  actor: GameObject = registry.actor
): boolean {
  return actorHasAtLeastOneItem(list, actor);
}

/**
 * Check whether actor has item in inventory.
 *
 * @param section - item section to check in the inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has all of provided items
 */
export function actorHasItem(section: TSection | TNumberId, actor: GameObject = registry.actor): boolean {
  return actor.object(section) !== null;
}

/**
 * Check whether actor has all items from provided list.
 *
 * @param sections - list of item sections to check in the inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has all of provided items
 */
export function actorHasItems(
  sections: LuaArray<TSection | TNumberId> | Array<TSection | TNumberId>,
  actor: GameObject = registry.actor
): boolean {
  for (const [, section] of sections as LuaArray<TSection | TNumberId>) {
    if (actor.object(section) === null) {
      return false;
    }
  }

  return true;
}

/**
 * @param section - item section to check in the inventory
 * @param count - desired item count to verify
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has desired count of provided section items
 */
export function actorHasItemCount(section: TSection, count: TCount, actor: GameObject = registry.actor): boolean {
  let hasCount: TCount = 0;

  actor.iterate_inventory((owner, item) => {
    // Count desired section.
    if (item.section() === section) {
      hasCount += 1;
    }

    // Stop iterating when conditions are met.
    if (hasCount === count) {
      return true;
    }
  }, actor);

  return hasCount >= count;
}

/**
 * Check whether actor has at least one item from the list.
 *
 * @param itemSections - list of item sections to check in the inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has at least one of provided items
 */
export function actorHasAtLeastOneItem(
  itemSections: LuaArray<TSection | TNumberId> | Array<TSection | TNumberId>,
  actor: GameObject = registry.actor
): boolean {
  for (const [, section] of itemSections as LuaArray<TSection | TNumberId>) {
    if (actor.object(section) !== null) {
      return true;
    }
  }

  return false;
}

/**
 * Check whether object has item in inventory.
 *
 * @param object - target object to check inventory
 * @param itemSectionOrId - item section or ID to check in inventory
 * @returns whether object has item in inventory
 */
export function objectHasItem(object: GameObject, itemSectionOrId: TSection | TNumberId): boolean {
  return object.object(itemSectionOrId) !== null;
}

/**
 * @param object - target item object to get upgrades from
 * @returns list of installed upgrades
 */
export function getItemInstalledUpgradesList(object: GameObject): LuaArray<TSection> {
  const list: LuaArray<TSection> = new LuaTable();

  object.iterate_installed_upgrades((it) => table.insert(list, it));

  return list;
}

/**
 * @param object - target item object to get upgrades from
 * @returns set of installed upgrades
 */
export function getItemInstalledUpgradesSet(object: GameObject): LuaTable<TSection, boolean> {
  const set: LuaTable<TSection, boolean> = new LuaTable();

  object.iterate_installed_upgrades((it) => set.set(it, true));

  return set;
}
