import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern, TCount } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { artefacts } from "@/engine/constants/items/artefacts";
import { detectors } from "@/engine/constants/items/detectors";
import { questItems } from "@/engine/constants/items/quest_items";
import { getManager, registry } from "@/engine/core/database";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveMoneyToActor, transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Give a scientific detector from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_transfer_detector_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
  }
);

/**
 * Reward the actor with Owl's money share.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_give_owls_share_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    giveMoneyToActor(1_500);
  }
);

/**
 * Check whether the actor carries the compass artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the compass artefact.
 */
extern("dialogs_zaton.zat_b30_actor_has_compass", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(artefacts.af_compass));
});

/**
 * Take the compass artefact from the actor, reward money and reveal treasure coordinates.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_transfer_af_from_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_compass);
  giveMoneyToActor(10_000);

  const treasureManager: TreasureManager = getManager(TreasureManager);

  treasureManager.giveActorTreasureCoordinates("zat_hiding_place_49");
  treasureManager.giveActorTreasureCoordinates("zat_hiding_place_15");
});

/**
 * Check whether the barman has accumulated daily percent owed to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored day counter is greater than zero.
 */
extern("dialogs_zaton.zat_b30_barmen_has_percent", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const count: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

  return count > 0;
});

/**
 * Check whether the barman has no accumulated daily percent owed to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored day counter is below one.
 */
extern(
  "dialogs_zaton.zat_b30_barmen_do_not_has_percent",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const count: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

    return count < 1;
  }
);

/**
 * Check whether the actor carries Noah's PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns Noah's PDA quest item.
 */
extern("dialogs_zaton.zat_b30_actor_has_noah_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_b20_noah_pda));
});

/**
 * Sell Noah's PDA to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_sell_noah_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b20_noah_pda);
  giveMoneyToActor(1000);
});
