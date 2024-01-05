import { IDynamicObjectState, IRegistryObjectState } from "@/engine/core/database/database_types";
import { registry } from "@/engine/core/database/registry";
import { GameObject, Optional, TNumberId } from "@/engine/lib/types";

/**
 * Register game object in lua in-memory registry.
 *
 * @param object - client game object to register
 * @returns registry object for provided game object
 */
export function registerObject(object: GameObject): IRegistryObjectState {
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
 * Unregister game object from lya in-memory registry.
 *
 * @param object - client game object to unregister
 */
export function unregisterObject(object: GameObject): void {
  registry.objects.delete(object.id());
}

/**
 * Reset object state in registry.
 * Supply partial to override empty state.
 *
 * @param object - client game object to reset state
 * @param state - optional initial state to use for reset
 * @returns new game object state object
 */
export function resetObject(object: GameObject, state: Partial<IRegistryObjectState> = {}): IRegistryObjectState {
  state.object = object;
  registry.objects.set(object.id(), state as IRegistryObjectState);

  return state as IRegistryObjectState;
}

/**
 * Get dynamic state for game object.
 * Dynamic state is persistent and saved in files by lua marshal lib.
 *
 * @param objectId - game object ID
 * @param initialize - whether data should be initialized in case it is null
 * @returns dynamic state of the object
 */
export function getObjectDynamicState(objectId: TNumberId, initialize?: boolean): IDynamicObjectState {
  let state: Optional<IDynamicObjectState> = registry.dynamicData.objects.get(objectId);

  if (state === null && initialize) {
    state = {} as IDynamicObjectState;
    registry.dynamicData.objects.set(objectId, state);
  }

  return state;
}

/**
 * Register dynamic state for game object.
 *
 * @param objectId - game object ID
 * @returns new initialized dynamic state
 */
export function registerObjectDynamicState(objectId: TNumberId): IDynamicObjectState {
  const state: IDynamicObjectState = {} as IDynamicObjectState;

  registry.dynamicData.objects.set(objectId, state);

  return state;
}

/**
 * Unregister dynamic state for the object.
 *
 * @param objectId - game object ID
 */
export function unregisterObjectDynamicState(objectId: TNumberId): void {
  registry.dynamicData.objects.delete(objectId);
}
