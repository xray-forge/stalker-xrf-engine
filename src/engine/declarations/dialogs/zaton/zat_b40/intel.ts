import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Sell the zat_b40 notebook to the NPC, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b40_transfer_notebook", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b40_notebook);
  giveInfoPortion(infoPortions.zat_b40_notebook_saled);
  giveMoneyToActor(2000);
});

/**
 * Sell the first zat_b40 mercenary PDA, reward money and mark completion if all items are sold.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b40_transfer_merc_pda_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b40_pda_1);
  giveInfoPortion(infoPortions.zat_b40_pda_1_saled);
  giveMoneyToActor(1000);

  if (
    hasInfoPortion(infoPortions.zat_b40_notebook_saled) &&
    hasInfoPortion(infoPortions.zat_b40_pda_1_saled) &&
    hasInfoPortion(infoPortions.zat_b40_pda_2_saled)
  ) {
    giveInfoPortion(infoPortions.zat_b40_all_item_saled);
  }
});

/**
 * Sell the second zat_b40 mercenary PDA, reward money and mark completion if all items are sold.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b40_transfer_merc_pda_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b40_pda_2);
  giveInfoPortion(infoPortions.zat_b40_pda_2_saled);
  giveMoneyToActor(1_000);

  if (
    hasInfoPortion(infoPortions.zat_b40_notebook_saled) &&
    hasInfoPortion(infoPortions.zat_b40_pda_1_saled) &&
    hasInfoPortion(infoPortions.zat_b40_pda_2_saled)
  ) {
    giveInfoPortion(infoPortions.zat_b40_all_item_saled);
  }
});

/**
 * Check whether the actor carries the zat_b40 notebook.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the zat_b40 notebook quest item.
 */
extern("dialogs_zaton.zat_b40_actor_has_notebook", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_b40_notebook));
});

/**
 * Check whether the actor carries the first zat_b40 mercenary PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the first zat_b40 mercenary PDA.
 */
extern("dialogs_zaton.zat_b40_actor_has_merc_pda_1", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_b40_pda_1));
});

/**
 * Check whether the actor carries the second zat_b40 mercenary PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the second zat_b40 mercenary PDA.
 */
extern("dialogs_zaton.zat_b40_actor_has_merc_pda_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.zat_b40_pda_2));
});
