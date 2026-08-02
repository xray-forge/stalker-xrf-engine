import { GameObject } from "xray16/alias";
import { extern, TCount } from "xray16/lib";
import { $fromObject } from "xray16/macros";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions/info_portions";
import { TInventoryItem } from "@/engine/constants/items";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { disableInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Descriptor of the medkit supply contents granted for each pri_a25 medic kit tier.
 */
const medicItemsTable = $fromObject({
  basic: $fromObject({
    [food.conserva]: 2,
    [drugs.medkit_army]: 2,
    [drugs.antirad]: 2,
    [drugs.bandage]: 4,
  }),
  advanced: $fromObject({
    [food.conserva]: 3,
    [drugs.medkit_army]: 3,
    [drugs.antirad]: 3,
    [drugs.bandage]: 5,
  }),
  elite: $fromObject({
    [food.conserva]: 4,
    [drugs.medkit_army]: 5,
    [drugs.antirad]: 5,
    [drugs.bandage]: 8,
  }),
}) as unknown as LuaTable<TInfoPortion, LuaTable<TInventoryItem, TCount>>;

/**
 * Transfer the medkit supplies to the actor based on the requested kit tier and disable that request.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_a25_medic_give_kit", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  let kit = "basic";

  if (hasInfoPortion(infoPortions.pri_a25_actor_needs_medikit_advanced_supply)) {
    kit = "advanced";
  } else if (hasInfoPortion(infoPortions.pri_a25_actor_needs_medikit_elite_supply)) {
    kit = "elite";
  }

  for (const [key, itemsList] of medicItemsTable) {
    if (key === kit) {
      for (const [section, count] of itemsList) {
        transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), section, count);
      }

      disableInfoPortion(key);
    }
  }
});
