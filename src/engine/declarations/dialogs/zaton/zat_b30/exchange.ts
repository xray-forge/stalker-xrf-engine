import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyObject, extern, TCount, TNumberId, TSection } from "xray16/lib";
import { $fromArray, $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions";
import { detectors } from "@/engine/constants/items/detectors";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { getNpcSpeaker, isObjectName } from "@/engine/core/utils/dialog";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasAtLeastOneItem, objectHasItem } from "@/engine/core/utils/item";
import { giveMoneyToActor, transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Reward the actor with accumulated daily percent money and reset the day counter.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_transfer_percent", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const amount: TCount = math.random(5, 25) * 100;
  const days: TCount = getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);

  giveMoneyToActor(amount * days);
  setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0);
});

/**
 * Check whether the dialog NPC carries a scientific detector.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the NPC speaker owns the scientific detector.
 */
extern("dialogs_zaton.zat_b30_npc_has_detector", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return objectHasItem(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
});

/**
 * Give a scientific detector from the NPC to the actor as the second exchange step.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_actor_second_exchange", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
});

/**
 * Exchange the actor good gun for a scientific detector and mark the matching rival info portion.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b30_actor_exchange", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  if ($isNotNil((actor as AnyObject).goodGun)) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), (actor as AnyObject).goodGun);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_scientific);
    (actor as AnyObject).goodGun = null;
  }

  if (isObjectName(secondSpeaker, "zat_b29_stalker_rival_1")) {
    giveInfoPortion(infoPortions.zat_b30_rival_1_wo_detector);
  } else if (isObjectName(secondSpeaker, "zat_b29_stalker_rival_2")) {
    giveInfoPortion(infoPortions.zat_b30_rival_2_wo_detector);
  }
});

/**
 * Check whether the actor carries more than one scientific detector.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least two scientific detectors.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_two_detectors",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const actor: GameObject = registry.actor;
    let cnt: number = 0;

    actor.iterate_inventory((object, item) => {
      if (item.section() === detectors.detector_scientific) {
        cnt = cnt + 1;
      }
    }, actor);

    return cnt > 1;
  }
);

/**
 * Check whether the actor owns at least one nimble weapon variant.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor carries any of the known nimble weapons.
 */
extern("dialogs_zaton.actor_has_nimble_weapon", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return actorHasAtLeastOneItem(
    $fromArray<TSection | TNumberId>([
      weapons.wpn_groza_nimble,
      weapons.wpn_vintorez_nimble,
      weapons.wpn_desert_eagle_nimble,
      weapons.wpn_fn2000_nimble,
      weapons.wpn_g36_nimble,
      weapons.wpn_protecta_nimble,
      weapons.wpn_mp5_nimble,
      weapons.wpn_sig220_nimble,
      weapons.wpn_spas12_nimble,
      weapons.wpn_svu_nimble,
      weapons.wpn_svd_nimble,
    ])
  );
});
