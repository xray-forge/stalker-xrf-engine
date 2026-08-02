import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { food } from "@/engine/constants/items/food";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Give the actor a can of food from the NPC speaker for the b19 quest.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b19_transfer_conserva_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.conserva);
  }
);

/**
 * Give the actor the b19 treasure coordinates as a reward.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b19_reward", (_: GameObject, __: GameObject): void => {
  TreasureManager.giveTreasureCoordinates("jup_hiding_place_38");
});
