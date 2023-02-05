import { ammo } from "@/mod/globals/items/ammo";
import { detectors } from "@/mod/globals/items/detectors";
import { drugs } from "@/mod/globals/items/drugs";
import { food } from "@/mod/globals/items/food";
import { helmets } from "@/mod/globals/items/helmets";
import { misc } from "@/mod/globals/items/misc";
import { outfits } from "@/mod/globals/items/outfits";
import { weapon_addons } from "@/mod/globals/items/weapon_addons";
import { weapons } from "@/mod/globals/items/weapons";

export const lootable_table = {
  ...ammo,
  ...detectors,
  ...drugs,
  ...food,
  ...helmets,
  ...outfits,
  ...weapon_addons,
  ...weapons,
} as const;

export type TLootableItems = typeof lootable_table;

export type TLootableItem = TLootableItems[keyof TLootableItems];

export const lootable_table_exclude = {
  [misc.device_pda]: misc.device_pda,
  [misc.guitar_a]: misc.guitar_a,
  [misc.harmonica_a]: misc.harmonica_a,
  [weapons.wpn_binoc]: weapons.wpn_binoc,
  [weapons.wpn_binocular]: weapons.wpn_binocular,
  [weapons.wpn_binocular_s]: weapons.wpn_binocular_s,
} as const;

export type TLootableExcludeItems = typeof lootable_table_exclude;

export type TLootableExcludeItem = TLootableExcludeItems[keyof TLootableExcludeItems];
