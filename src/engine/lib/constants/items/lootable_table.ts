import { ammo } from "@/engine/lib/constants/items/ammo";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { weaponAddons } from "@/engine/lib/constants/items/weapon_addons";
import { weapons } from "@/engine/lib/constants/items/weapons";

export const lootableTable = {
  ...ammo,
  ...detectors,
  ...drugs,
  ...food,
  ...helmets,
  ...outfits,
  ...weaponAddons,
  ...weapons,
} as const;

export type TLootableItems = typeof lootableTable;

export type TLootableItem = TLootableItems[keyof TLootableItems];

export const lootableTableExclude = {
  [misc.device_pda]: misc.device_pda,
  [misc.guitar_a]: misc.guitar_a,
  [misc.device_torch]: misc.device_torch,
  [misc.harmonica_a]: misc.harmonica_a,
  [weapons.wpn_binoc]: weapons.wpn_binoc,
  [weapons.wpn_binocular]: weapons.wpn_binocular,
  [weapons.wpn_binocular_s]: weapons.wpn_binocular_s,
} as const;

export type TLootableExcludeItems = typeof lootableTableExclude;

export type TLootableExcludeItem = TLootableExcludeItems[keyof TLootableExcludeItems];
