import { AlifeSimulator, GameObject, ServerCreatureObject } from "xray16/alias";
import { extern, getDistanceBetween, Nillable, TDistance } from "xray16/lib";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";

/**
 * Check whether the actor is far enough behind the object and its squad during the `pas_b400` escort.
 *
 * @param actor - Actor game object whose distance is measured.
 * @param object - Escorted game object whose position and squad members are compared against the actor.
 * @returns Whether the actor is past the backward point and beyond the required distance from the object and squad.
 */
extern("xr_conditions.pas_b400_actor_far_backward", (actor: GameObject, object: GameObject): boolean => {
  const backwardObject: Nillable<GameObject> = getObjectByStoryId("pas_b400_bwd");

  if (backwardObject) {
    if (getDistanceBetween(backwardObject, registry.actor) > getDistanceBetween(backwardObject, object)) {
      return false;
    }
  } else {
    return false;
  }

  const distance: TDistance = 70 * 70;
  const selfDistance: TDistance = object.position().distance_to_sqr(actor.position());

  if (selfDistance < distance) {
    return false;
  }

  const sim: AlifeSimulator = registry.simulator;
  const squad: Squad = sim.object<Squad>(sim.object<ServerCreatureObject>(object.id())!.group_id)!;

  for (const squadMember of squad.squad_members()) {
    const otherDistance: TDistance = squadMember.object.position.distance_to_sqr(actor.position());

    if (otherDistance < distance) {
      return false;
    }
  }

  return true;
});
