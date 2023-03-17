import { ammo } from "@/engine/globals/items/ammo";
import { detectors } from "@/engine/globals/items/detectors";
import { drugs } from "@/engine/globals/items/drugs";
import { food } from "@/engine/globals/items/food";
import { helmets } from "@/engine/globals/items/helmets";
import { misc } from "@/engine/globals/items/misc";
import { outfits } from "@/engine/globals/items/outfits";
import { weapon_addons } from "@/engine/globals/items/weapon_addons";
import { weapons } from "@/engine/globals/items/weapons";

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
  [misc.device_torch]: misc.device_torch,
  [misc.harmonica_a]: misc.harmonica_a,
  [weapons.wpn_binoc]: weapons.wpn_binoc,
  [weapons.wpn_binocular]: weapons.wpn_binocular,
  [weapons.wpn_binocular_s]: weapons.wpn_binocular_s,
} as const;

export type TLootableExcludeItems = typeof lootable_table_exclude;

export type TLootableExcludeItem = TLootableExcludeItems[keyof TLootableExcludeItems];
