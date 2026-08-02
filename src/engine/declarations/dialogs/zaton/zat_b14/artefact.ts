import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { artefacts } from "@/engine/constants/items/artefacts";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Reward the actor with money for the bar quest line.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b14_bar_transfer_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  giveMoneyToActor(1000);
});

/**
 * Transfer the twisted quest artefact from the actor to the dialog NPC.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b14_transfer_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_quest_b14_twisted);
});

/**
 * Check whether the speaker carries the twisted quest artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the first speaker owns the twisted quest artefact.
 */
extern("dialogs_zaton.actor_has_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return $isNotNil(firstSpeaker.object(artefacts.af_quest_b14_twisted));
});

/**
 * Check whether the speaker does not carry the twisted quest artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the first speaker lacks the twisted quest artefact.
 */
extern("dialogs_zaton.actor_hasnt_artefact", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("actor_has_artefact", getExtern("dialogs_zaton"))(firstSpeaker, secondSpeaker);
});
