import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ClientObject } from "@/engine/lib/types";

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
