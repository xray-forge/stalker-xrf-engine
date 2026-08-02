import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { giveMoneyToActor } from "@/engine/core/utils/reward";

/**
 * Reward the actor with money for killing the b211 bloodsuckers.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b211_kill_bludsuckers_reward", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(3000);
});
