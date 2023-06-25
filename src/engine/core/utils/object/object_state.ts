import { registry } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { ClientObject } from "@/engine/lib/types";

/**
 * todo;
 */
export function isObjectAsleep(object: ClientObject): boolean {
  return registry.objects.get(object.id()).stateManager!.animstate.states.currentState === EStalkerState.SLEEP;
}
