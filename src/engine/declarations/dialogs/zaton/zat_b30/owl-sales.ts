import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsFromActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Transfer 1000 money from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_transfer_1000", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
});

/**
 * Transfer 200 money from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_transfer_200", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 200);
});

/**
 * Sell the monolith hiding place PDA to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_pri_b36_monolith_hiding_place_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.pri_b36_monolith_hiding_place_pda);
    giveMoneyToActor(5000);
  }
);

/**
 * Sell the envoy PDA to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_sell_pri_b306_envoy_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.pri_b306_envoy_pda);
  giveMoneyToActor(4000);
});

/**
 * Sell the mercenary contract PDA to the NPC, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b207_merc_pda_with_contract",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b207_merc_pda_with_contract);
    giveMoneyToActor(1000);
    giveInfoPortion(infoPortions.jup_b207_merc_pda_with_contract_sold);
  }
);

/**
 * Sell the first Strelok notes to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_01);
    giveMoneyToActor(500);
  }
);

/**
 * Sell the second Strelok notes to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_02);
    giveMoneyToActor(500);
  }
);

/**
 * Sell the third Strelok notes to the NPC and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_sell_jup_b10_strelok_notes_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_notes_03);
    giveMoneyToActor(500);
  }
);
