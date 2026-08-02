import { EGameObjectRelation, GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Check whether object has friendly relations with actor.
 */
extern("xr_conditions.actor_friend", (actor: GameObject, object: GameObject): boolean => {
  return object.relation(actor) === EGameObjectRelation.FRIEND;
});
