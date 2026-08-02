import { GameObject } from "xray16/alias";
import { extern, LuaArray, TCount, TIndex, TRate } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { TInventoryItem } from "@/engine/constants/items";
import { getObjectIdByStoryId } from "@/engine/core/database";
import { spawnObjectInObject } from "@/engine/core/utils/spawn";

/**
 * Spawn a randomized weighted set of loot items into the Zaton b202 snag treasure box.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param p - Unused parameters tuple.
 */
extern("xr_effects.zat_b202_spawn_random_loot", (actor: GameObject, object: GameObject, p: []) => {
  const spawnItemsList: Array<Array<{ item: Array<TInventoryItem> }>> = [
    [
      {
        item: [
          "bandage",
          "bandage",
          "bandage",
          "bandage",
          "bandage",
          "medkit",
          "medkit",
          "medkit",
          "conserva",
          "conserva",
        ],
      },
      { item: ["medkit", "medkit", "medkit", "medkit", "medkit", "vodka", "vodka", "vodka", "kolbasa", "kolbasa"] },
      { item: ["antirad", "antirad", "antirad", "medkit", "medkit", "bandage", "kolbasa", "kolbasa", "conserva"] },
    ],
    [
      { item: ["grenade_f1", "grenade_f1", "grenade_f1"] },
      { item: ["grenade_rgd5", "grenade_rgd5", "grenade_rgd5", "grenade_rgd5", "grenade_rgd5"] },
    ],
    [{ item: ["detector_elite"] }, { item: ["detector_advanced"] }],
    [{ item: ["helm_hardhat"] }, { item: ["helm_respirator"] }],
    [
      { item: ["wpn_val", "ammo_9x39_ap", "ammo_9x39_ap", "ammo_9x39_ap"] },
      { item: ["wpn_spas12", "ammo_12x70_buck", "ammo_12x70_buck", "ammo_12x70_buck", "ammo_12x70_buck"] },
      {
        item: [
          "wpn_desert_eagle",
          "ammo_11.43x23_fmj",
          "ammo_11.43x23_fmj",
          "ammo_11.43x23_hydro",
          "ammo_11.43x23_hydro",
        ],
      },
      { item: ["wpn_abakan", "ammo_5.45x39_ap", "ammo_5.45x39_ap"] },
      { item: ["wpn_sig550", "ammo_5.56x45_ap", "ammo_5.56x45_ap"] },
      { item: ["wpn_ak74", "ammo_5.45x39_fmj", "ammo_5.45x39_fmj"] },
      { item: ["wpn_l85", "ammo_5.56x45_ss190", "ammo_5.56x45_ss190"] },
    ],
    [{ item: ["specops_outfit"] }, { item: ["stalker_outfit"] }],
  ];

  const weightList: LuaArray<TRate> = $fromArray<TRate>([2, 2, 2, 2, 4, 4]);

  const spawnedItems = new LuaTable();
  let maxWeight: TCount = 12;

  // todo: Simplify, seems like too complex...
  while (maxWeight > 0) {
    let n: number = 0;
    let prap: boolean = true;

    do {
      prap = true;
      n = math.random(1, weightList.length());

      for (const [_k, v] of spawnedItems) {
        if (v === n) {
          prap = false;
          break;
        }
      }
    } while (!(prap && maxWeight - weightList.get(n) >= 0));

    maxWeight = maxWeight - weightList.get(n);
    table.insert(spawnedItems, n);

    const item: TIndex = math.random(1, spawnItemsList[n - 1].length);

    for (const itemSection of spawnItemsList[n - 1][item - 1].item) {
      spawnObjectInObject(itemSection, getObjectIdByStoryId("jup_b202_snag_treasure"));
    }
  }
});
