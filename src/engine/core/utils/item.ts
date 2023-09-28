import { registry } from "@/engine/core/database";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { ClientObject, LuaArray, TNumberId, TRate, TSection } from "@/engine/lib/types";

/**
 * Set item condition.
 *
 * @param object - client object to change condition
 * @param condition - value from 0 to 100, percents
 */
export function setItemCondition(object: ClientObject, condition: TRate): void {
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
  actor: ClientObject = registry.actor
): boolean {
  return actorHasAtLeastOneItem(list, actor);
}

/**
 * Check whether actor has item in inventory.
 *
 * @param itemSection - list of item sections to check in the inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has all of provided items
 */
export function actorHasItem(itemSection: TSection | TNumberId, actor: ClientObject = registry.actor): boolean {
  return actor.object(itemSection) !== null;
}

/**
 * Check whether actor has all items from provided list.
 *
 * @param itemSections - list of item sections to check in the inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has all of provided items
 */
export function actorHasItems(
  itemSections: LuaArray<TSection | TNumberId> | Array<TSection | TNumberId>,
  actor: ClientObject = registry.actor
): boolean {
  for (const [, section] of itemSections as LuaArray<TSection | TNumberId>) {
    if (actor.object(section) === null) {
      return false;
    }
  }

  return true;
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
  actor: ClientObject = registry.actor
): boolean {
  for (const [index, section] of itemSections as LuaArray<TSection | TNumberId>) {
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
export function objectHasItem(object: ClientObject, itemSectionOrId: TSection | TNumberId): boolean {
  return object.object(itemSectionOrId) !== null;
}
