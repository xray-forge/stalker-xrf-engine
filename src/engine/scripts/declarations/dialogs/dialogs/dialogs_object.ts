import { registry } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { extern } from "@/engine/core/utils/binding";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { getNpcSpeaker, updateObjectDialog } from "@/engine/core/utils/dialog";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { communities } from "@/engine/lib/constants/communities";
import { EGameObjectRelation, EScheme, GameObject, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Update current state of NPC dialog logics / meet state.
 */
extern("dialogs.update_npc_dialog", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  updateObjectDialog(getNpcSpeaker(firstSpeaker, secondSpeaker));
});

/**
 * Check if speaking with wounded object.
 */
extern("dialogs.is_wounded", (actor: GameObject, object: GameObject): boolean => {
  return isObjectWounded(getNpcSpeaker(actor, object).id());
});

/**
 * Check if speaking with not wounded object.
 */
extern("dialogs.is_not_wounded", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectWounded(getNpcSpeaker(firstSpeaker, secondSpeaker).id());
});

/**
 * todo;
 */
extern("dialogs.allow_wounded_dialog", (object: GameObject, victim: GameObject, id: TNumberId): boolean => {
  return (registry.objects.get(victim.id())[EScheme.WOUNDED] as ISchemeWoundedState)?.helpDialog === id;
});

/**
 * Check whether actor is friend with object.
 */
extern("dialogs.is_friend", (actor: GameObject, object: GameObject): boolean => {
  return actor.relation(object) === EGameObjectRelation.FRIEND;
});

/**
 * Check whether actor is not friend with object.
 */
extern("dialogs.is_not_friend", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return firstSpeaker.relation(secondSpeaker) !== EGameObjectRelation.FRIEND;
});

/**
 * Become friends with object.
 */
extern("dialogs.become_friend", (actor: GameObject, object: GameObject): void => {
  actor.set_relation(EGameObjectRelation.FRIEND, object);
});

/**
 * Check if speaking with stalker community member.
 */
extern("dialogs.npc_stalker", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.stalker;
});

/**
 * Check if speaking with bandit community member.
 */
extern("dialogs.npc_bandit", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.bandit;
});

/**
 * Check if speaking with freedom community member.
 */
extern("dialogs.npc_freedom", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.freedom;
});

/**
 * Check if speaking with dolg community member.
 */
extern("dialogs.npc_dolg", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.dolg;
});

/**
 * Check if speaking with army community member.
 */
extern("dialogs.npc_army", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.army;
});
