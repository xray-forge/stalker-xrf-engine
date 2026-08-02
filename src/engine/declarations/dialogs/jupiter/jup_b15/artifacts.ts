import { GameObject } from "xray16/alias";
import { AnyCallablesModule, extern, getExtern } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { artefacts } from "@/engine/constants/items/artefacts";
import { outfits } from "@/engine/constants/items/outfits";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor has the mincer meat artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the mincer meat artefact.
 */
extern("dialogs_jupiter.if_actor_has_af_mincer_meat", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return $isNotNil(firstSpeaker.object(artefacts.af_mincer_meat));
});

/**
 * Check whether the actor has the fuzz kolobok artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the fuzz kolobok artefact.
 */
extern("dialogs_jupiter.if_actor_has_af_fuzz_kolobok", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return $isNotNil(firstSpeaker.object(artefacts.af_fuzz_kolobok));
});

/**
 * Check whether the actor has the mincer meat or fuzz kolobok artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has either artefact.
 */
extern("dialogs_jupiter.actor_has_first_or_second_artefact", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return (
    $isNotNil(firstSpeaker.object(artefacts.af_mincer_meat)) ||
    $isNotNil(firstSpeaker.object(artefacts.af_fuzz_kolobok))
  );
});

/**
 * Transfer the mincer meat artefact from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.transfer_af_mincer_meat", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_mincer_meat);
});

/**
 * Decrement the b15 drunk-count counter for the actor and return the effect result.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the counter effect succeeded.
 */
extern("dialogs_jupiter.jup_b15_dec_counter", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, object, ["jup_b15_full_drunk_count", 1]);
});

/**
 * Transfer the fuzz kolobok artefact from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.transfer_af_fuzz_kolobok", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "af_fuzz_kolobok");
});

/**
 * Check whether the actor has the scientific outfit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the scientific outfit.
 */
extern("dialogs_jupiter.jup_b15_actor_sci_outfit", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(outfits.scientific_outfit));
});

/**
 * Check whether the actor does not have the scientific outfit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks the scientific outfit.
 */
extern("dialogs_jupiter.jup_b15_no_actor_sci_outfit", (_: GameObject, __: GameObject): boolean => {
  return $isNil(registry.actor.object(outfits.scientific_outfit));
});
