import { hit, patrol } from "xray16";
import { GameObject, Hit } from "xray16/alias";
import { extern, Nillable, subVectors } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

import { logger } from "./shared";

/**
 * Hit an object referenced by story ID with the provided bone, power, impulse and direction.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object used as the fallback hit source position and draftsman.
 * @param params - Tuple of target story ID, bone name, power, impulse and Nillable direction patrol path.
 */
extern(
  "xr_effects.hit_obj",
  (_: GameObject, object: GameObject, params: [string, string, number, number, string, string]): void => {
    const h: hit = new hit();
    const storyObject: Nillable<GameObject> = getObjectByStoryId(params[0]);

    if (!storyObject) {
      return;
    }

    logger.info("Hit object: %s %s", object.name(), storyObject.name());

    h.bone(params[1]);
    h.power = params[2];
    h.impulse = params[3];

    if (params[4]) {
      h.direction = subVectors(new patrol(params[4]).point(0), storyObject.position());
    } else {
      h.direction = subVectors(object.position(), storyObject.position());
    }

    h.draftsman = object;
    h.type = hit.wound;
    storyObject.hit(h);
  }
);
