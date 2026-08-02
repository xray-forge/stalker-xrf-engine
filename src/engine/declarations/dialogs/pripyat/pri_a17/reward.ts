import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Give the actor a money reward for the pri_a17 quest, scaled by the outcome info portion.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_a17_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (hasInfoPortion(infoPortions.pri_a17_reward_well)) {
    giveMoneyToActor(7500);
  } else if (hasInfoPortion(infoPortions.pri_a17_reward_norm)) {
    giveMoneyToActor(4000);
  } else if (hasInfoPortion(infoPortions.pri_a17_reward_bad)) {
    giveMoneyToActor(3000);
  }
});

/**
 * Check whether the actor possesses the pri_a17 gauss rifle.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the actor has the pri_a17 gauss rifle in inventory.
 */
extern(
  "dialogs_pripyat.actor_has_pri_a17_gauss_rifle",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object("pri_a17_gauss_rifle"));
  }
);

/**
 * Check whether the actor does not possess the pri_a17 gauss rifle.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the actor is missing the pri_a17 gauss rifle.
 */
extern(
  "dialogs_pripyat.actor_hasnt_pri_a17_gauss_rifle",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("actor_has_pri_a17_gauss_rifle", getExtern("dialogs_pripyat"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the af_baloon artefact from the NPC to the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.transfer_artifact_af_baloon", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_baloon);
});

/**
 * Check whether Sokolov is no longer at the base because he left and died.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Sokolov has left the base and is dead.
 */
extern(
  "dialogs_pripyat.pri_a17_sokolov_is_not_at_base",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(infoPortions.pri_a15_sokolov_out) && hasInfoPortion(infoPortions.pas_b400_sokolov_dead);
  }
);
