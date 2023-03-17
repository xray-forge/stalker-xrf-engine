import { ammo } from "@/engine/lib/constants/items/ammo";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { weapon_addons } from "@/engine/lib/constants/items/weapon_addons";
import { weapons } from "@/engine/lib/constants/items/weapons";

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
