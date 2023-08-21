import { alife, hit } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { createVector } from "@/engine/core/utils/vector";
import { ClientObject, Hit, Maybe, Optional } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function giveWoundedObjectMedkit(object: ClientObject): void {
  // Give script medkit to heal up for an object.
  alife().create("medkit_script", object.position(), object.level_vertex_id(), object.game_vertex_id(), object.id());
}

/**
 * todo;
 */
export function setObjectWounded(object: ClientObject): void {
  const hitObject: Hit = new hit();

  hitObject.type = hit.fire_wound;
  hitObject.power = math.max(object.health - 0.01, 0);
  hitObject.impulse = 0.0;
  hitObject.direction = createVector(0, 0, -1);
  hitObject.draftsman = object;

  object.hit(hitObject);
}

/**
 * Allow wounded object to heal.
 *
 * todo;
 */
export function enableObjectWoundedHealing(object: ClientObject): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.unlockMedkit();
}

/**
 * todo: Description.
 */
export function isObjectPsyWounded(object: ClientObject): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  if (state.wounded !== null) {
    const woundState: Optional<string> = (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager
      .woundState as Optional<string>;

    return (
      woundState === "psy_pain" ||
      woundState === "psy_armed" ||
      woundState === "psy_shoot" ||
      woundState === "psycho_pain" ||
      woundState === "psycho_shoot"
    );
  }

  return false;
}
