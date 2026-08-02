import { hit } from "xray16";
import { GameObject, Hit } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Hit target from name of actor.
 * Usually used to become enemies based on hit.
 */
extern(
  "xr_effects.hit_npc_from_actor",
  (actor: GameObject, object: GameObject, [storyId]: [Nillable<TStringId>] = [null]): void => {
    const hitObject: Hit = new hit();
    const target: GameObject = storyId ? (getObjectByStoryId(storyId) as GameObject) : object;

    hitObject.direction = actor.position().sub(target.position());
    hitObject.draftsman = actor;
    hitObject.type = hit.wound;
    hitObject.power = 0.001;
    hitObject.impulse = 0.001;
    hitObject.bone("bip01_spine");

    target.hit(hitObject);
  }
);
