import { GameObject } from "xray16/alias";
import { extern, LuaArray } from "xray16/lib";
import { $fromArray, $isNil, $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { artefacts } from "@/engine/constants/items/artefacts";
import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor carries at least one of Strelok's notes.
 *
 * @returns Whether the actor has any of the three Strelok notes.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_notes", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_b10_notes_01)) ||
    $isNotNil(actor.object(questItems.jup_b10_notes_02)) ||
    $isNotNil(actor.object(questItems.jup_b10_notes_03))
  );
});

/**
 * Check whether the actor carries only Strelok's first note.
 *
 * @returns Whether the actor has note 1 and neither note 2 nor note 3.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_1", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_b10_notes_01)) &&
    $isNil(actor.object(questItems.jup_b10_notes_02)) &&
    $isNil(actor.object(questItems.jup_b10_notes_03))
  );
});

/**
 * Check whether the actor carries only Strelok's second note.
 *
 * @returns Whether the actor has note 2 and neither note 1 nor note 3.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_2", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_b10_notes_02)) &&
    $isNil(actor.object(questItems.jup_b10_notes_01)) &&
    $isNil(actor.object(questItems.jup_b10_notes_03))
  );
});

/**
 * Check whether the actor carries only Strelok's third note.
 *
 * @returns Whether the actor has note 3 and neither note 1 nor note 2.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_3", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_b10_notes_03)) &&
    $isNil(actor.object(questItems.jup_b10_notes_01)) &&
    $isNil(actor.object(questItems.jup_b10_notes_02))
  );
});

/**
 * Check whether the actor carries Strelok's first and second notes but not the third.
 *
 * @returns Whether the actor has notes 1 and 2 but not note 3.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_12", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_b10_notes_01)) &&
    $isNotNil(actor.object(questItems.jup_b10_notes_02)) &&
    $isNil(actor.object(questItems.jup_b10_notes_03))
  );
});

/**
 * Check whether the actor carries Strelok's first and third notes but not the second.
 *
 * @returns Whether the actor has notes 1 and 3 but not note 2.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_13", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_b10_notes_01)) &&
    $isNotNil(actor.object(questItems.jup_b10_notes_03)) &&
    $isNil(actor.object(questItems.jup_b10_notes_02))
  );
});

/**
 * Check whether the actor carries Strelok's second and third notes but not the first.
 *
 * @returns Whether the actor has notes 2 and 3 but not note 1.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_23", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_b10_notes_02)) &&
    $isNotNil(actor.object(questItems.jup_b10_notes_03)) &&
    $isNil(actor.object(questItems.jup_b10_notes_01))
  );
});

/**
 * Check whether the actor carries all three of Strelok's notes.
 *
 * @returns Whether the actor has notes 1, 2 and 3.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_all", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(questItems.jup_b10_notes_01)) &&
    $isNotNil(actor.object(questItems.jup_b10_notes_02)) &&
    $isNotNil(actor.object(questItems.jup_b10_notes_03))
  );
});

/**
 * Take Strelok's notes from the actor and give rewards scaled to how many notes were handed over.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_b305_sell_strelok_notes", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const itemsTable: LuaArray<string> = $fromArray<string>([
    questItems.jup_b10_notes_01,
    questItems.jup_b10_notes_02,
    questItems.jup_b10_notes_03,
  ]);
  const actor: GameObject = registry.actor;

  let amount: number = 0;

  for (const [_k, v] of itemsTable) {
    if ($isNotNil(actor.object(v))) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), v);
      amount = amount + 1;
    }
  }

  if ($isNotNil(actor.object(weapons.wpn_gauss))) {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo.ammo_gauss, 2);
  } else {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic, 3);
  }

  if (amount > 1) {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_fire);
  }

  if (amount > 2) {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_glass);
    giveInfoPortion(infoPortions.pri_b305_all_strelok_notes_given);
  }
});
