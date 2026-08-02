import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Sell the evacuation info to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_evacuation_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_evacuation_info_sold);
  }
);

/**
 * Sell the meeting info to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_meeting_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_meeting_info_sold);
  }
);

/**
 * Sell the losses info to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_losses_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_losses_info_sold);
  }
);

/**
 * Sell the delivery info to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_delivery_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_delivery_info_sold);
  }
);

/**
 * Sell the flash drive to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_device_flash_snag",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.device_flash_snag);
    giveMoneyToActor(200);
    registry.actor.give_info_portion(infoPortions.device_flash_snag_sold);
  }
);

/**
 * Sell the port bandit leader PDA to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.device_pda_port_bandit_leader);
    giveMoneyToActor(1000);
    giveInfoPortion(infoPortions.device_pda_port_bandit_leader_sold);
  }
);

/**
 * Sell the UFO memory device to Owl, reward money and mark the sale info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_ufo_memory_2);
    giveMoneyToActor(500);
    giveInfoPortion(infoPortions.jup_b10_ufo_memory_2_sold);
  }
);

/**
 * Sell the bandit PDA to Owl and reward the actor with money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b202_bandit_pda);
    giveMoneyToActor(500);
  }
);
