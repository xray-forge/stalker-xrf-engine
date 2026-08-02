import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { artefacts } from "@/engine/constants/items/artefacts";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor has the b16 oasis heart artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the oasis artefact.
 */
extern("dialogs_jupiter.if_actor_has_jup_b16_oasis_artifact", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return $isNotNil(firstSpeaker.object(artefacts.af_oasis_heart));
});

/**
 * Check whether the actor does not have the b16 oasis heart artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the oasis artefact.
 */
extern(
  "dialogs_jupiter.if_actor_hasnt_jup_b16_oasis_artifact",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("if_actor_has_jup_b16_oasis_artifact", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Reward the actor with money for the b16 oasis quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_b16_reward", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(7000);
});

/**
 * Transfer the b16 oasis heart artefact from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.give_jup_b16_oasis_artifact", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_oasis_heart);
});
