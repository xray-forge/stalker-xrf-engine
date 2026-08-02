import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { weapons } from "@/engine/constants/items/weapons";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Check whether the current in-game time falls within the zat_b106 hunting window.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the current time is at or after 02:45 and before 05:00.
 */
extern("dialogs_zaton.is_zat_b106_hunting_time", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (level.get_time_hours() >= 2 && level.get_time_hours() < 5) {
    if (level.get_time_hours() > 2) {
      return true;
    } else if (level.get_time_minutes() >= 45) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether the current in-game time is outside the zat_b106 hunting window.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the current time is not within the hunting window.
 */
extern("dialogs_zaton.is_not_zat_b106_hunting_time", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (level.get_time_hours() >= 2 && level.get_time_hours() < 5) {
    if (level.get_time_hours() > 2) {
      return false;
    } else if (level.get_time_minutes() >= 45) {
      return false;
    }
  }

  return true;
});

/**
 * Reward the actor with money for the Soroka task, reduced if Flint was blamed.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b106_soroka_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom)
  ) {
    giveMoneyToActor(1000);
  } else {
    giveMoneyToActor(3000);
  }
});

/**
 * Give a SPAS-12 shotgun from the NPC to the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b106_transfer_weap_to_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_spas12);
});

/**
 * Reveal the zat_b106 treasure coordinates as a reward.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b106_give_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  TreasureManager.giveTreasureCoordinates("zat_hiding_place_50");
});

/**
 * Check whether Soroka has left because Flint was blamed.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether either Flint blame info portion is set.
 */
extern("dialogs_zaton.zat_b106_soroka_gone", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom)
  );
});

/**
 * Check whether Soroka has not left.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether neither Flint blame info portion is set.
 */
extern("dialogs_zaton.zat_b106_soroka_not_gone", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("zat_b106_soroka_gone", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});
