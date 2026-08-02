import { EGameObjectRelation, GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";

import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { getObjectsRelationSafe } from "@/engine/core/utils/relation";

/**
 * Check whether the NPC speaker is located in the jup_b4 smart terrain.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the NPC is in the b4 smart terrain.
 */
extern("dialogs_jupiter.npc_in_b4_smart", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b4");
});

/**
 * Check whether the actor is not an enemy of the Freedom NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is not an enemy.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_not_enemies_to_freedom",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b4_is_actor_enemies_to_freedom", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor is an enemy of the Freedom NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is an enemy.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_enemies_to_freedom",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.ENEMY;
  }
);

/**
 * Check whether the actor is a friend of the Freedom NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is a friend.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_friend_to_freedom",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.FRIEND;
  }
);

/**
 * Check whether the actor is neutral toward the Freedom NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is neutral.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_neutral_to_freedom",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.NEUTRAL;
  }
);

/**
 * Check whether the actor is not an enemy of the Duty NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is not an enemy.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_not_enemies_to_dolg",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b4_is_actor_enemies_to_dolg", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor is an enemy of the Duty NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is an enemy.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_enemies_to_dolg",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.ENEMY;
  }
);

/**
 * Check whether the actor is a friend of the Duty NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is a friend.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_friend_to_dolg",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.FRIEND;
  }
);

/**
 * Check whether the actor is neutral toward the Duty NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is neutral.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_neutral_to_dolg",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return firstSpeaker.relation(secondSpeaker) === EGameObjectRelation.NEUTRAL;
  }
);
