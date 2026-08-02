import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor, transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Transfer the b10 UFO memory item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_memory_give_to_npc",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_ufo_memory);
  }
);

/**
 * Check whether the actor has the b10 UFO memory item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the UFO memory.
 */
extern("dialogs_jupiter.jup_b10_ufo_memory_give_to_actor", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return $isNotNil(firstSpeaker.object(questItems.jup_b10_ufo_memory));
});

/**
 * Give the actor the second b10 UFO memory item from the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_memory_2_give_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_ufo_memory_2);
  }
);

/**
 * Check whether the actor has at least the lower b10 UFO fee of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough money.
 */
extern("dialogs_jupiter.jup_b10_ufo_has_money_1000", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 1000;
});

/**
 * Check whether the actor has at least the higher b10 UFO fee of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough money.
 */
extern("dialogs_jupiter.jup_b10_ufo_has_money_3000", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 2000;
});

/**
 * Check whether the actor cannot afford the lower b10 UFO fee.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required money.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_hasnt_money_1000",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b10_ufo_has_money_1000", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor cannot afford the higher b10 UFO fee.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required money.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_hasnt_money_3000",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b10_ufo_has_money_3000", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the lower b10 UFO fee from the actor.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_relocate_money_1000",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
  }
);

/**
 * Take the higher b10 UFO fee from the actor.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_relocate_money_3000",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
  }
);

/**
 * Check whether the actor has the b10 UFO memory item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the UFO memory.
 */
extern("dialogs_jupiter.jup_b10_actor_has_ufo_memory", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_b10_ufo_memory));
});
