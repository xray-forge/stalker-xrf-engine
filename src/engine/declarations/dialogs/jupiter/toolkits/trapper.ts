import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { weapons } from "@/engine/constants/items/weapons";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Give the trapper Winchester reward weapon from the NPC speaker to the actor.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_trapper_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_wincheaster1300_trapper);
});

/**
 * Reward the actor with money for the trapper quest, paying more if the chimera was killed in one hit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.zat_b106_trapper_reward", (_: GameObject, __: GameObject): void => {
  if (hasInfoPortion(infoPortions.zat_b106_one_hit)) {
    giveMoneyToActor(3000);
  } else {
    giveMoneyToActor(2000);
  }
});
