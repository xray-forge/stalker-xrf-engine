import { ammo } from "@/mod/globals/items/ammo";
import { detectors } from "@/mod/globals/items/detectors";
import { drugs } from "@/mod/globals/items/drugs";
import { food } from "@/mod/globals/items/food";
import { helmets } from "@/mod/globals/items/helmets";
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
  ...weapons
} as const;

export type TLootableItems = typeof lootable_table;

export type TLootableItem = TLootableItems[keyof TLootableItems];
