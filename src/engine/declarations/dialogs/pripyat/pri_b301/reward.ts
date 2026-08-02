import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { weapons } from "@/engine/constants/items/weapons";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Transfer the PKM machine gun reward from Zulus to the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_b301_zulus_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_pkm_zulus);
});
