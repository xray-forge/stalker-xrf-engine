import { TSection } from "xray16/lib";

import { squadMonsters } from "@/engine/constants/behaviours";
import { ammo, TAmmoItem } from "@/engine/constants/items/ammo";
import { lootableTable, lootableTableExclude } from "@/engine/constants/items/lootable_table";

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
