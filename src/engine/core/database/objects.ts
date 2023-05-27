import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { ClientObject, Optional } from "@/engine/lib/types";

/**
 * Register client object in RAM registry.
 *
 * @param object - client game object to register
 * @returns registry object for provided game object
 */
export function registerObject(object: ClientObject): IRegistryObjectState {
  const stored: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  if (stored === null) {
    const newRecord: IRegistryObjectState = { object: object } as IRegistryObjectState;

    registry.objects.set(object.id(), newRecord);

    return newRecord;
  } else {
    stored.object = object;

    return stored;
  }
}

/**
 * Unregister client object from RAM registry.
 *
 * @param object - client game object to unregister
 */
export function unregisterObject(object: ClientObject): void {
  registry.objects.delete(object.id());
}

/**
 * Reset object state in registry.
 * Supply partial to override empty state.
 *
 * @param object - client game object to reset state
 * @param state - optional initial state to use for reset
 * @returns new client object state object
 */
export function resetObject(object: ClientObject, state: Partial<IRegistryObjectState> = {}): IRegistryObjectState {
  state.object = object;
  registry.objects.set(object.id(), state as IRegistryObjectState);

  return state as IRegistryObjectState;
}
