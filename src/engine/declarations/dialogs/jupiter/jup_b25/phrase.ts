import { GameObject } from "xray16/alias";
import { AnyCallablesModule, extern, getExtern } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";

/**
 * Increment the b25 phrase counter for the actor and return the effect result.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the counter effect succeeded.
 */
extern("dialogs_jupiter.jup_b25_frase_count_inc", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").inc_counter(actor, object, ["jup_b25_frase", 1]);
});
