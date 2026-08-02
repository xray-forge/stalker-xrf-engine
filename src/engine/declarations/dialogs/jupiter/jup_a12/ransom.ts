import { GameObject } from "xray16/alias";
import { extern, LuaArray, TCount, TName } from "xray16/lib";
import { $fromArray, $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { artefacts, TArtefact } from "@/engine/constants/items/artefacts";
import { getManager, registry } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import {
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";

/**
 * Check whether the actor has at least the a12 ransom of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough money.
 */
extern("dialogs_jupiter.jup_a12_actor_has_15000_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 15000;
});

/**
 * Check whether the actor has less than the a12 ransom of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks the ransom money.
 */
extern("dialogs_jupiter.jup_a12_actor_do_not_has_15000_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() < 15000;
});

/**
 * List of artefacts accepted as the a12 ransom.
 */
const jupA12AfTable: LuaArray<TArtefact> = $fromArray<TArtefact>([
  artefacts.af_fire,
  artefacts.af_gold_fish,
  artefacts.af_glass,
  artefacts.af_ice,
]);

/**
 * Check whether the actor has any of the a12 ransom artefacts.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has a ransom artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefacts", (_: GameObject, __: GameObject): boolean => {
  for (const [_k, v] of jupA12AfTable) {
    if ($isNotNil(registry.actor.object(v))) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether the actor has the first a12 ransom artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the first artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefact_1", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(jupA12AfTable.get(1)));
});

/**
 * Check whether the actor has the second a12 ransom artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the second artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefact_2", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(jupA12AfTable.get(2)));
});

/**
 * Check whether the actor has the third a12 ransom artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the third artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefact_3", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(jupA12AfTable.get(3)));
});

/**
 * Check whether the actor has the fourth a12 ransom artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the fourth artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefact_4", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(jupA12AfTable.get(4)));
});

/**
 * Check whether the actor has none of the a12 ransom artefacts.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks all ransom artefacts.
 */
extern("dialogs_jupiter.jup_a12_actor_do_not_has_artefacts", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  for (const [_k, v] of jupA12AfTable) {
    if ($isNotNil(actor.object(v))) {
      return false;
    }
  }

  return true;
});

/**
 * Take the a12 ransom from the actor as money or the matching artefact, depending on the chosen info portion.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_ransom_from_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    if (hasInfoPortion(infoPortions.jup_a12_ransom_by_money)) {
      transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 15000);

      return;
    }

    const jupA12InfoTable: LuaArray<TName> = $fromArray<TName>([
      "jup_a12_af_fire",
      "jup_a12_af_gold_fish",
      "jup_a12_af_glass",
      "jup_a12_af_ice",
    ]);

    for (const i of $range(1, 4)) {
      if (hasInfoPortion(jupA12InfoTable.get(i))) {
        transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), jupA12AfTable.get(i));

        return;
      }
    }
  }
);

/**
 * Reward the actor with money and treasure coordinates for the a12 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_a12_transfer_5000_money_to_actor", (_: GameObject, __: GameObject): void => {
  const treasureManager: TreasureManager = getManager(TreasureManager);

  giveMoneyToActor(5000);

  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_40");
  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_34");
});

/**
 * Give the actor the gold fish artefact, plus treasure coordinates if the prisoner was freed.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_artefact_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_gold_fish);

    if (hasInfoPortion(infoPortions.jup_a12_stalker_prisoner_free_dialog_done)) {
      const treasureManager: TreasureManager = getManager(TreasureManager);

      treasureManager.giveActorTreasureCoordinates("jup_hiding_place_40");
      treasureManager.giveActorTreasureCoordinates("jup_hiding_place_34");
    }
  }
);

/**
 * Take a random amount of money from the actor for the a12 cashier, capped at what the actor owns.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_cashier_money_from_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    let amount: TCount = math.random(20, 50) * 100;
    const actor: GameObject = registry.actor;

    if (actor.money() < amount) {
      amount = actor.money();
    }

    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
  }
);
