import { GameObject } from "xray16/alias";
import { extern, TCount } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { weapons } from "@/engine/constants/items/weapons";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Transfer the SVD rifle and its ammunition from the NPC to the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_b35_transfer_svd", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_svd);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo["ammo_7.62x54_7h1"]);
});

/**
 * Give the actor the pri_b35 ammunition reward, tripled when the secondary objective is completed.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_b35_give_actor_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const amount: TCount = hasInfoPortion(infoPortions.pri_b35_secondary) ? 3 : 1;

  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo["ammo_7.62x54_7h1"], amount);
});
