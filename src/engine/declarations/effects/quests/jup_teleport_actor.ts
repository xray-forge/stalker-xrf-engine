import { patrol } from "xray16";
import { GameObject, Vector } from "xray16/alias";
import { createVector, extern } from "xray16/lib";

/**
 * Teleport the actor across the Jupiter b16 teleport anomaly preserving the relative offset.
 *
 * @param actor - Actor game object that is teleported.
 * @param object - Game object owning the logics scheme.
 */
extern("xr_effects.jup_teleport_actor", (actor: GameObject, object: GameObject): void => {
  const pointIn: Vector = new patrol("jup_b16_teleport_in").point(0);
  const pointOut: Vector = new patrol("jup_b16_teleport_out").point(0);
  const actorPosition: Vector = actor.position();
  const outPosition: Vector = createVector(
    actorPosition.x - pointIn.x + pointOut.x,
    actorPosition.y - pointIn.y + pointOut.y,
    actorPosition.z - pointIn.z + pointOut.z
  );

  actor.set_actor_position(outPosition);
});
