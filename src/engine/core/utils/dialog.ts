import { registry } from "@/engine/core/database";
import { updateStalkerLogic } from "@/engine/core/objects/binders";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { updateObjectMeetAvailability } from "@/engine/core/schemes/stalker/meet/utils";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { EScheme, GameObject, Optional, TName } from "@/engine/lib/types";

/**
 * From two possible speakers pick NPC one, omit actor.
 *
 * @param first - possible non-actor speaker
 * @param second - possible non-actor speaker
 * @returns non-actor game object picked from parameters
 */
export function getNpcSpeaker(first: GameObject, second: GameObject): GameObject {
  return second.id() === ACTOR_ID ? first : second;
}

/**
 * Check whether NPC name matches provided parameter.
 *
 * @param object - target object to check name
 * @param name - target name to check
 * @returns whether object name is matching provided string
 */
export function isObjectName(object: GameObject, name: TName): boolean {
  const objectName: Optional<string> = object.name();

  return objectName !== null && string.find(objectName, name)[0] !== null;
}

/**
 * Break current actor dialog with game object.
 *
 * @param object - target game object to break dialog with
 */
export function breakObjectDialog(object: GameObject): void {
  registry.actor.stop_talk();
  object.stop_talk();
}

/**
 * Update current state of object dialog.
 * Run logics sync and updates.
 *
 * @param object - target game object to update dialog for
 */
export function updateObjectDialog(object: GameObject): void {
  (registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState).meetManager.update();
  updateObjectMeetAvailability(object);
  updateStalkerLogic(object);
}
