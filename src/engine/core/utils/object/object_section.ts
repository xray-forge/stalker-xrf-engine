import { squadMonsters } from "@/engine/lib/constants/behaviours";
import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { lootableTable, lootableTableExclude } from "@/engine/lib/constants/items/lootable_table";
import { TSection } from "@/engine/lib/types";

/**
 * Check whether provided section is ammo.
 *
 * @param section - section to check if it is ammo
 * @returns whether section is ammo-defined.
 */
export function isAmmoSection(section: TSection): section is TAmmoItem {
  return section in ammo;
}

/**
 * @returns whether object can be looted by stalkers from corpses.
 */
export function isLootableItemSection(section: TSection): boolean {
  return section in lootableTable;
}

/**
 * Checks whether provided object can be looted from corpses.
 *
 * @param section - object section to check if lootable.
 * @returns whether object is excluded from loot drop.
 */
export function isExcludedFromLootDropItemSection(section: TSection): boolean {
  return section in lootableTableExclude;
}

/**
 * Check whether provided community is squad monster.
 *
 * @param community - target community to check
 * @returns whether community matches squad monsters
 */
export function isSquadMonsterCommunity(community: TSection): boolean {
  return community in squadMonsters;
}
