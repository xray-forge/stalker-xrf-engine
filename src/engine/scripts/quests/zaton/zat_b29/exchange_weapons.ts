import { GameObject } from "xray16/alias";
import { LuaArray, TSection } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { TWeapon, weapons } from "@/engine/constants/items/weapons";

/**
 * Collect the sections of valuable weapons present in the given object inventory.
 *
 * @param object - Game object whose inventory is scanned for valuable weapons.
 * @returns Array of valuable weapon sections found in the inventory.
 */
export function getGoodGunsInInventory(object: GameObject): LuaArray<TWeapon> {
  const actorWpnTable: LuaArray<TWeapon> = new LuaTable();
  const wpnTable: LuaArray<TWeapon> = $fromArray<TWeapon>([
    weapons.wpn_sig550,
    weapons.wpn_g36,
    weapons.wpn_val,
    weapons.wpn_groza,
    weapons.wpn_vintorez,
    weapons.wpn_fn2000,
  ]);

  object.iterate_inventory((owner: GameObject, item: GameObject): void => {
    const section: TSection = item.section();

    for (const [_k, v] of wpnTable) {
      if (section === v) {
        table.insert(actorWpnTable, v);
        break;
      }
    }
  }, object);

  return actorWpnTable;
}
