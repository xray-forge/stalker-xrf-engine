import { GameObject } from "xray16/alias";
import { AnyCallablesModule, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { drugs } from "@/engine/constants/items/drugs";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { transferItemsFromActor } from "@/engine/core/utils/reward";

/**
 * Check whether the actor carries any kind of medkit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has a medkit.
 */
extern("dialogs_jupiter.jup_b202_actor_has_medkit", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    $isNotNil(actor.object(drugs.medkit)) ||
    $isNotNil(actor.object(drugs.medkit_army)) ||
    $isNotNil(actor.object(drugs.medkit_scientic))
  );
});

/**
 * Mark the b202 bandit as hit by the actor and turn the bandit squad hostile.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b202_hit_bandit_from_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
    const actor: GameObject = registry.actor;

    giveInfoPortion(infoPortions.jup_b202_bandit_hited);
    giveInfoPortion(infoPortions.jup_b202_bandit_hited_by_actor);
    getExtern<AnyCallablesModule>("xr_effects").set_squad_goodwill(actor, object, ["jup_b202_bandit_squad", "enemy"]);
  }
);

/**
 * Check the precondition for the b202 medic dialog based on the gather squad and testimony info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the medic dialog is available.
 */
extern("dialogs_jupiter.jup_b202_medic_dialog_precondition", (_: GameObject, __: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_gather_squad_complete)) {
    return !hasInfoPortion(infoPortions.jup_b202_polustanok);
  } else {
    return !hasInfoPortion(infoPortions.jup_b52_medic_testimony);
  }
});

/**
 * Transfer one available medkit of any kind from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b202_transfer_medkit", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  if ($isNotNil(actor.object(drugs.medkit))) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit);
  } else if ($isNotNil(actor.object(drugs.medkit_army))) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_army);
  } else if ($isNotNil(actor.object(drugs.medkit_scientic))) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic);
  }
});
