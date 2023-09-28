import { registry } from "@/engine/core/database";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { medkits, TMedkit } from "@/engine/lib/constants/items/drugs";
import { ClientObject, LuaArray, Optional, TName, TNumberId, TSection } from "@/engine/lib/types";

/**
 * From two possible speakers pick NPC one, omit actor.
 *
 * @param first - possible non-actor speaker
 * @param second - possible non-actor speaker
 * @returns non-actor game object picked from parameters
 */
export function getNpcSpeaker(first: ClientObject, second: ClientObject): ClientObject {
  return second.id() === ACTOR_ID ? first : second;
}

/**
 * Get available medkit or null.
 *
 * @param list - list of medical kits to check in inventory
 * @param actor - target object to get medkit, gets actor from registry by default
 * @returns get medkit or null
 */
export function getActorAvailableMedKit(
  list: LuaArray<TSection | TNumberId> = $fromObject(medkits) as unknown as LuaArray<TSection | TNumberId>,
  actor: ClientObject = registry.actor
): Optional<TMedkit> {
  for (const [key, medkit] of list) {
    if (actor.object(medkit) !== null) {
      return medkit as TMedkit;
    }
  }

  return null;
}

/**
 * Check whether NPC name matches provided parameter.
 *
 * @param object - target object to check name
 * @param name - target name to check
 * @returns whether object name is matching provided string
 */
export function isObjectName(object: ClientObject, name: TName): boolean {
  const objectName: Optional<string> = object.name();

  return objectName !== null && string.find(objectName, name)[0] !== null;
}
