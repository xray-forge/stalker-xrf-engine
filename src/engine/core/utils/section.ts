import { squadMonsters } from "@/engine/lib/constants/behaviours";
import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { lootableTable, lootableTableExclude } from "@/engine/lib/constants/items/lootable_table";
import { TSection } from "@/engine/lib/types";

/**
 * @param section - Section to check if it is ammo.
 * @returns Whether section is ammo-defined.
 */
export function isAmmoSection(section: TSection): section is TAmmoItem {
  return section in ammo;
}

/**
 * @returns Whether object can be looted by stalkers from corpses.
 */
export function isLootableItemSection(section: TSection): boolean {
  return section in lootableTable;
}

/**
 * @param section - Object section to check if lootable.
 * @returns Whether object is excluded from loot drop.
 */
export function isExcludedFromLootDropItemSection(section: TSection): boolean {
  return section in lootableTableExclude;
}

/**
 * @param community - Target community to check.
 * @returns Whether community matches squad monsters.
 */
export function isSquadMonsterCommunity(community: TSection): boolean {
  return community in squadMonsters;
}
