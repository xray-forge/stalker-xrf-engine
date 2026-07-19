import { ammo } from "@/engine/constants/items/ammo";
import { detectors } from "@/engine/constants/items/detectors";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { helmets } from "@/engine/constants/items/helmets";
import { misc } from "@/engine/constants/items/misc";
import { outfits } from "@/engine/constants/items/outfits";
import { weaponAddons, weapons } from "@/engine/constants/items/weapons";

/**
 * List of items that can be looted by stalkers from corpses.
 *
 * @inline
 */
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

export const lootableTableExclude = {
  [misc.device_pda]: misc.device_pda,
  [misc.guitar_a]: misc.guitar_a,
  [misc.device_torch]: misc.device_torch,
  [misc.harmonica_a]: misc.harmonica_a,
  [weapons.wpn_binoc]: weapons.wpn_binoc,
} as const;
