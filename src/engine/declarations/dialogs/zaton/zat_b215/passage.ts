import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the way-to-Pripyat counter exceeds three.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the stored way-to-Pripyat counter is greater than three.
 */
extern("dialogs_zaton.zat_b215_counter_greater_3", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "zat_a9_way_to_pripyat_counter", 0 as number) > 3;
});

/**
 * Check whether the poor actor has enough money for the cheaper Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 1000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_poor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 1000;
  }
);

/**
 * Check whether the poor actor lacks the money for the cheaper passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 1000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_poor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 1000;
  }
);

/**
 * Check whether the poor actor has enough money for the Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 4000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 4000;
  }
);

/**
 * Check whether the poor actor lacks the money for the Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 4000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 4000;
  }
);

/**
 * Check whether the rich actor has enough money for the passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 3000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_rich",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 3000;
  }
);

/**
 * Check whether the rich actor lacks the money for the passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 3000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_rich",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 3000;
  }
);

/**
 * Check whether the rich actor has enough money for the Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least 6000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 6000;
  }
);

/**
 * Check whether the rich actor lacks the money for the Pripyat passage.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns less than 6000 money.
 */
extern(
  "dialogs_zaton.zat_b215_actor_has_no_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 6000;
  }
);

/**
 * Transfer the 1000 money poor passage fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b215_relocate_money_poor", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
});

/**
 * Transfer the 4000 money poor Pripyat passage fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b215_relocate_money_poor_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 4000);
  }
);

/**
 * Transfer the 3000 money rich passage fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b215_relocate_money_rich", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 3000);
});

/**
 * Transfer the 6000 money rich Pripyat passage fee from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern(
  "dialogs_zaton.zat_b215_relocate_money_rich_pripyat",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 6000);
  }
);
