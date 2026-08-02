import { GameObject } from "xray16/alias";
import { extern, TCount, TNumberId, TSection } from "xray16/lib";
import { $fromArray, $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasAtLeastOneItem } from "@/engine/core/utils/item";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor carries any of the zat_b12 documents.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least one of the zat_b12 documents.
 */
extern("dialogs_zaton.zat_b12_actor_have_documents", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return actorHasAtLeastOneItem(
    $fromArray<TSection | TNumberId>([questItems.zat_b12_documents_1, questItems.zat_b12_documents_2])
  );
});

/**
 * Take the zat_b12 documents from the actor and pay a price based on the document types and count.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Always false so that the dialog phrase is not auto-closed by the condition.
 */
extern(
  "dialogs_zaton.zat_b12_actor_transfer_documents",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
    const actor: GameObject = registry.actor;

    const amountDoc1: TCount = 1000;
    const amountDoc2: TCount = 600;
    const amountDoc3: TCount = 400;

    let amountTotal: TCount = 0;
    let cnt: TCount = 0;
    let cnt2: TCount = 0;

    if ($isNotNil(actor.object(questItems.zat_b12_documents_1))) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b12_documents_1);
      giveInfoPortion(infoPortions.zat_b12_documents_sold_1);
      amountTotal = amountTotal + amountDoc1;
    }

    object.iterate_inventory((temp, item) => {
      if (item.section() === questItems.zat_b12_documents_2) {
        cnt = cnt + 1;
      }
    }, object);

    actor.iterate_inventory((temp, item) => {
      if (item.section() === questItems.zat_b12_documents_2) {
        cnt2 = cnt2 + 1;
      }
    }, actor);

    if ($isNotNil(actor.object(questItems.zat_b12_documents_2))) {
      if (cnt < 1) {
        amountTotal = amountTotal + amountDoc2;

        if (cnt2 > 1) {
          amountTotal = amountTotal + amountDoc3 * (cnt2 - 1);
          giveInfoPortion(infoPortions.zat_b12_documents_sold_2);
        }
      } else {
        amountTotal = amountTotal + amountDoc3 * cnt2;
        giveInfoPortion(infoPortions.zat_b12_documents_sold_3);
      }

      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.zat_b12_documents_2, cnt2);
    }

    giveMoneyToActor(amountTotal);

    return false;
  }
);
