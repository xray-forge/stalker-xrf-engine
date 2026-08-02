import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern, TCount } from "xray16/lib";

import { detectors } from "@/engine/constants/items/detectors";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Transfer three elite detectors from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.zat_b30_transfer_detectors", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_elite, 3);
});

/**
 * Check whether the actor does not have the elite detectors required for the b30 transfer.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required detectors.
 */
extern(
  "dialogs_jupiter.zat_b30_actor_do_not_has_transfer_items",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("zat_b30_actor_has_transfer_items", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor carries at least three elite detectors in the inventory.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough detectors.
 */
extern("dialogs_jupiter.zat_b30_actor_has_transfer_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;
  let cnt: TCount = 0;

  function zatB30Count(object: GameObject, item: GameObject): void {
    if (item.section() === "detector_elite") {
      cnt = cnt + 1;
    }
  }

  actor.iterate_inventory(zatB30Count, actor);

  return cnt >= 3;
});
