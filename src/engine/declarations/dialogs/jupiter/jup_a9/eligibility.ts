import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor has any of the a9 quest documents.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has any a9 quest item.
 */
extern("dialogs_jupiter.jupiter_a9_actor_has_any_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_a9_delivery_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_evacuation_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_losses_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_power_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_conservation_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_way_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_meeting_info))
  );
});

/**
 * Check whether the actor has the a9 conservation info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the conservation info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_conservation_info", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_a9_conservation_info));
});

/**
 * Check whether the actor does not have the a9 conservation info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the conservation info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_conservation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_conservation_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 conservation info item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.actor_relocate_conservation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_conservation_info);
  }
);

/**
 * Check whether the actor has the a9 power info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the power info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_power_info", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_a9_power_info));
});

/**
 * Check whether the actor does not have the a9 power info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the power info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_power_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_power_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 power info item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_power_info", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_power_info);
});

/**
 * Check whether the actor has the a9 way info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the way info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_way_info", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_a9_way_info));
});

/**
 * Check whether the actor does not have the a9 way info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the way info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_way_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_way_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 way info item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_way_info", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_way_info);
});
