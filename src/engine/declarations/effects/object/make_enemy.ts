import { hit } from "xray16";
import { GameObject, Hit } from "xray16/alias";
import { extern, Nillable, Nullable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Make objects enemies.
 * Hit object or second parameter story ID from name of first story ID parameter.
 */
extern(
  "xr_effects.make_enemy",
  (_: GameObject, object: GameObject, [from, to]: [TStringId, Nillable<TStringId>]): void => {
    const target: GameObject = to ? (getObjectByStoryId(to) as GameObject) : object;
    const hitObject: Hit = new hit();

    hitObject.draftsman = getObjectByStoryId(from) as Nullable<GameObject>;

    hitObject.type = hit.wound;
    hitObject.direction = hitObject.draftsman!.position().sub(target.position());
    hitObject.bone("bip01_spine");
    hitObject.power = 0.03;
    hitObject.impulse = 0.03;

    target.hit(hitObject);
  }
);
