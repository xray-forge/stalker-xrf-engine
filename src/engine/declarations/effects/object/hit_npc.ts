import { hit, patrol } from "xray16";
import { GameObject, Hit } from "xray16/alias";
import { extern, Nillable, TRUE } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getObjectByStoryId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Hit the linked object from a source story object or patrol point, Nillablely reversing the direction.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object that receives the hit.
 * @param params - Tuple of source story ID or self, patrol path, bone, power, impulse and reverse flag.
 */
extern(
  "xr_effects.hit_npc",
  (_: GameObject, object: GameObject, params: [string, string, string, number, number, string]): void => {
    logger.info("Hit object: %s", object.name());

    const targetHit: Hit = new hit();
    const rev: boolean = params[5] ? params[5] === TRUE : false;

    targetHit.draftsman = object;
    targetHit.type = hit.wound;
    if (params[0] !== "self") {
      const hitter: Nillable<GameObject> = getObjectByStoryId(params[0]);

      if (!hitter) {
        return;
      }

      if (rev) {
        targetHit.draftsman = hitter;
        targetHit.direction = hitter.position().sub(object.position());
      } else {
        targetHit.direction = object.position().sub(hitter.position());
      }
    } else {
      if (rev) {
        targetHit.draftsman = null;
        targetHit.direction = object.position().sub(new patrol(params[1]).point(0));
      } else {
        targetHit.direction = new patrol(params[1]).point(0).sub(object.position());
      }
    }

    targetHit.bone(params[2]);
    targetHit.power = params[3];
    targetHit.impulse = params[4];

    object.hit(targetHit);
  }
);
