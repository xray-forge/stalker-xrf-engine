import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveMoneyToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";

/**
 * Take the guide fee from the actor for travelling to Pripyat.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.pay_cost_to_guide_to_pripyat", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
});

/**
 * Check whether the actor has at least the b43 fee of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough money.
 */
extern("dialogs_jupiter.jup_b43_actor_has_5000_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 5000;
});

/**
 * Check whether the actor has less than the b43 fee of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks the required money.
 */
extern("dialogs_jupiter.jup_b43_actor_do_not_has_5000_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() < 5000;
});

/**
 * Reward the actor with money for the first b43 artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b43_reward_for_first_artefact", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(2500);
});

/**
 * Reward the actor with money for the second b43 artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b43_reward_for_second_artefact", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(3500);
});

/**
 * Reward the actor with money for both b43 artefacts.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b43_reward_for_both_artefacts", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(6000);
});
