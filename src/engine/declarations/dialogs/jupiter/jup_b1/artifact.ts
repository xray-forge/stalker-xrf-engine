import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern, PartialRecord } from "xray16/lib";
import { $fromObject, $isNotNil } from "xray16/macros";

import { drugs } from "@/engine/constants/items/drugs";
import { helmets, THelmet } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveMoneyToActor, transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Transfer the b1 half artefact from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.give_jup_b1_art", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b1_half_artifact");
});

/**
 * Check whether the actor has the b1 half artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the half artefact.
 */
extern("dialogs_jupiter.if_actor_has_jup_b1_art", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object("jup_b1_half_artifact"));
});

/**
 * Check whether the actor is not wearing one of the accepted protective suits or helmets.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks a good suit.
 */
extern(
  "dialogs_jupiter.jup_b1_actor_do_not_have_good_suit",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b1_actor_have_good_suit", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Reward the actor with money for the b1 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b1_reward_actor", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(6000);
});

/**
 * Check whether the actor is wearing one of the accepted protective suits or helmets.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has a good suit.
 */
extern("dialogs_jupiter.jup_b1_actor_have_good_suit", (_: GameObject, __: GameObject): boolean => {
  const suitsList: LuaTable<string, boolean> = $fromObject<string, boolean>({
    [outfits.scientific_outfit]: true,
    [outfits.military_outfit]: true,
    [outfits.dolg_heavy_outfit]: true,
    [outfits.exo_outfit]: true,
    [outfits.svoboda_light_outfit]: true,
    [outfits.svoboda_heavy_outfit]: true,
    [outfits.cs_heavy_outfit]: true,
  });

  const helmetsList: LuaTable<THelmet, boolean | undefined> = $fromObject<PartialRecord<THelmet, boolean>>({
    [helmets.helm_battle]: true,
    [helmets.helm_tactic]: true,
    [helmets.helm_protective]: true,
  });

  const actor: GameObject = registry.actor;

  if ($isNotNil(actor.item_in_slot(7)) && suitsList.get(actor.item_in_slot(7)!.section())) {
    return true;
  }

  if ($isNotNil(actor.item_in_slot(12)) && helmetsList.get(actor.item_in_slot(12)!.section())) {
    return true;
  }

  return false;
});

/**
 * Give the actor medicine and a protective helmet as thanks from the b1 stalker squad.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b1_stalker_squad_thanks", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic, 3);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.antirad, 5);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_psy_blockade, 2);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_antidot, 2);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_radioprotector, 2);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_anabiotic);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), helmets.helm_protective);
});
