import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { giveMoneyToActor } from "@/engine/core/utils/reward";

/**
 * Reward the actor for the b208 burer hunt with money and treasure coordinates.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b208_give_reward", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(5000);

  const treasureManager: TreasureManager = getManager(TreasureManager);

  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_18");
  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_35");
  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_45");
});
