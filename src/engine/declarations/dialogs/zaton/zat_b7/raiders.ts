import { GameObject } from "xray16/alias";
import { extern, TCount, TIndex } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { storyIds } from "@/engine/constants/story_ids";
import { getManager, isStoryObjectExisting, registry } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Reward the actor with random money and treasure coordinates for the bandit outcome.
 *
 */
extern("dialogs_zaton.zat_b7_give_bandit_reward_to_actor", (): void => {
  giveMoneyToActor(math.random(15, 30) * 100);
  getManager(TreasureManager).giveActorTreasureCoordinates("zat_hiding_place_30");
});

/**
 * Reward the actor with a randomly chosen drug pack and treasure coordinates for the stalker outcome.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b7_give_stalker_reward_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    const reward: TIndex = math.random(1, 3);

    if (reward === 1) {
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.bandage, 6);
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka, 4);
    }

    if (reward === 2) {
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit, 2);
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka, 4);
    }

    if (reward === 3) {
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.antirad, 3);
      transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.vodka, 4);
    }

    TreasureManager.giveTreasureCoordinates("zat_hiding_place_29");
  }
);

/**
 * Reward the actor with a fixed drug pack for the second stalker outcome.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b7_give_stalker_reward_2_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.bandage, 4);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit, 2);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.antirad, 2);
  }
);

/**
 * Rob the actor of a random share of their money in favor of the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b7_rob_actor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  let amount: TCount = math.floor((registry.actor.money() * math.random(75, 100)) / 100);

  if (registry.actor.money() < amount) {
    amount = registry.actor.money();
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
});

/**
 * Check whether the self-kill dialog branch is still available for the stalkers victims squad.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the related info portions are unset and the victims squad story object no longer exists.
 */
extern("dialogs_zaton.zat_b7_killed_self_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (
    hasInfoPortion(infoPortions.zat_b7_stalkers_raiders_meet) ||
    hasInfoPortion(infoPortions.zat_b7_victims_disappeared)
  ) {
    return false;
  }

  return !isStoryObjectExisting(storyIds.zat_b7_stalkers_victims_1);
});

/**
 * Check whether the stalkers victims squad is still alive.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the victims squad story object still exists.
 */
extern("dialogs_zaton.zat_b7_squad_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStoryObjectExisting(storyIds.zat_b7_stalkers_victims_1);
});
