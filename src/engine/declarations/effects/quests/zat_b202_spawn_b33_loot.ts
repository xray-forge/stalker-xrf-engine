import { GameObject } from "xray16/alias";
import { extern, LuaArray, TStringId } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { TInventoryItem } from "@/engine/constants/items";
import { artefacts } from "@/engine/constants/items/artefacts";
import { drugs } from "@/engine/constants/items/drugs";
import { helmets } from "@/engine/constants/items/helmets";
import { weapons } from "@/engine/constants/items/weapons";
import { storyIds } from "@/engine/constants/story_ids";
import { getObjectIdByStoryId } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { spawnObjectInObject } from "@/engine/core/utils/spawn";

/**
 * Spawn the Zaton b33 reward items into their snag boxes for each reward not yet given to the actor.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param p - Unused parameters tuple.
 */
extern("xr_effects.zat_b202_spawn_b33_loot", (actor: GameObject, object: GameObject, p: []): void => {
  const infoPortionsList: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.zat_b33_first_item_gived,
    infoPortions.zat_b33_second_item_gived,
    infoPortions.zat_b33_third_item_gived,
    infoPortions.zat_b33_fourth_item_gived,
    infoPortions.zat_b33_fifth_item_gived,
  ]);

  const rewardItems: LuaArray<LuaArray<TInventoryItem>> = $fromArray<LuaArray<TInventoryItem>>([
    $fromArray<TInventoryItem>([weapons.wpn_fort_snag]),
    $fromArray<TInventoryItem>([
      drugs.medkit_scientic,
      drugs.medkit_scientic,
      drugs.medkit_scientic,
      drugs.antirad,
      drugs.antirad,
      drugs.antirad,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
    ]),
    $fromArray<TInventoryItem>([weapons.wpn_ak74u_snag]),
    $fromArray<TInventoryItem>([artefacts.af_soul]),
    $fromArray<TInventoryItem>([helmets.helm_hardhat_snag]),
  ]);

  for (const [index, infoPortion] of infoPortionsList) {
    const objectId: TStringId =
      index === 1 || index === 3 ? storyIds.jup_b202_stalker_snag : storyIds.jup_b202_snag_treasure;

    if (!hasInfoPortion(infoPortion)) {
      for (const [_, itemSection] of rewardItems.get(index)) {
        spawnObjectInObject(tostring(itemSection), getObjectIdByStoryId(tostring(objectId)));
      }
    }
  }
});
