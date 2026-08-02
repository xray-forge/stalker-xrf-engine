import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { actorHasItem } from "@/engine/core/utils/item";
import { transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor carries the medic PDA proof.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the zat_b22 medic PDA.
 */
extern("dialogs_zaton.zat_b22_actor_has_proof", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return actorHasItem(infoPortions.zat_b22_medic_pda);
});

/**
 * Take the zat_b22 medic PDA proof from the actor.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b22_transfer_proof", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), infoPortions.zat_b22_medic_pda);
});
