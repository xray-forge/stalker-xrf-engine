import { GameObject } from "xray16/alias";
import { ACTOR_ID, Nillable, TName } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { updateObjectMeetAvailability } from "@/engine/core/schemes/stalker/meet/utils";
import { getSchemeStateOptimistic } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { updateStalkerLogic } from "@/engine/core/utils/logics";

/**
 * From two possible speakers pick NPC one, omit actor.
 *
 * @inline
 *
 * @param first - Possible non-actor speaker.
 * @param second - Possible non-actor speaker.
 * @returns Non-actor game object picked from parameters.
 */
export function getNpcSpeaker(first: GameObject, second: GameObject): GameObject {
  return second.id() === ACTOR_ID ? first : second;
}

/**
 * Check whether NPC name matches provided parameter.
 *
 * @param object - Target object to check name.
 * @param name - Target name to check.
 * @returns Whether object name is matching provided string.
 */
export function isObjectName(object: GameObject, name: TName): boolean {
  const objectName: Nillable<string> = object.name();

  return $isNotNil(objectName) && $isNotNil(string.find(objectName, name)[0]);
}

/**
 * Break current actor dialog with game object.
 *
 * @param object - Game object to break dialog with.
 */
export function breakObjectDialog(object: GameObject): void {
  registry.actor.stop_talk();
  object.stop_talk();
}

/**
 * Update current state of object dialog.
 * Run logics sync and updates.
 *
 * @param object - Game object to update dialog for.
 */
export function updateObjectDialog(object: GameObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  getSchemeStateOptimistic(state, EScheme.MEET).meetManager.update();
  updateObjectMeetAvailability(object, state);
  updateStalkerLogic(object, state);
}
