import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor has the Sokolov note quest item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the note.
 */
extern("dialogs_jupiter.pri_a15_sokolov_actor_has_note", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_b205_sokolov_note));
});

/**
 * Check whether the actor does not have the Sokolov note quest item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the note.
 */
extern(
  "dialogs_jupiter.pri_a15_sokolov_actor_has_not_note",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("pri_a15_sokolov_actor_has_note", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the Sokolov note from the actor and give an army medkit in return.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.pri_a15_sokolov_actor_give_note",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b205_sokolov_note);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_army);
  }
);
