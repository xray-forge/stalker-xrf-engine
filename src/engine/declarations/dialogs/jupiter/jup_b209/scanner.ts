import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Give the actor the b209 monster scanner from the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b209_get_monster_scanner", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b209_monster_scanner", 1);
});

/**
 * Take the b209 monster scanner from the actor and return it to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b209_return_monster_scanner",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b209_monster_scanner", 1);
  }
);
