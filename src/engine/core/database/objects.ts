import { IDynamicObjectState, IRegistryObjectState } from "@/engine/core/database/database_types";
import { registry } from "@/engine/core/database/registry";
import { GameObject, Nillable, TNumberId } from "@/engine/lib/types";

/**
 * Register game object in lua in-memory registry.
 *
 * @param object - Client game object to register.
 * @returns Registry object for provided game object.
 */
export function registerObject(object: GameObject): IRegistryObjectState {
  const stored: Nillable<IRegistryObjectState> = registry.objects.get(object.id()) as Nillable<IRegistryObjectState>;

  if (stored) {
    stored.object = object;

    return stored;
  } else {
    const newRecord: IRegistryObjectState = { object: object } as IRegistryObjectState;

    registry.objects.set(object.id(), newRecord);

    return newRecord;
  }
}

/**
 * Unregister game object from lya in-memory registry.
 *
 * @param object - Client game object to unregister.
 */
export function unregisterObject(object: GameObject): void {
  registry.objects.delete(object.id());
}

/**
 * Reset object state in registry.
 * Supply partial to override empty state.
 *
 * @param object - Client game object to reset state.
 * @param state - Nillable initial state to use for reset.
 * @returns New game object state object.
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
 * @param objectId - Game object ID.
 * @param initialize - Whether data should be initialized in case it is null.
 * @returns Dynamic state of the object.
 */
export function getObjectDynamicState(objectId: TNumberId, initialize?: boolean): IDynamicObjectState {
  let state: Nillable<IDynamicObjectState> = registry.dynamicData.objects.get(objectId);

  if (!state && initialize) {
    state = {} as IDynamicObjectState;
    registry.dynamicData.objects.set(objectId, state);
  }

  return state;
}

/**
 * Register dynamic state for game object.
 *
 * @param objectId - Game object ID.
 * @returns New initialized dynamic state.
 */
export function registerObjectDynamicState(objectId: TNumberId): IDynamicObjectState {
  const state: IDynamicObjectState = {} as IDynamicObjectState;

  registry.dynamicData.objects.set(objectId, state);

  return state;
}

/**
 * Unregister dynamic state for the object.
 *
 * @param objectId - Game object ID.
 */
export function unregisterObjectDynamicState(objectId: TNumberId): void {
  registry.dynamicData.objects.delete(objectId);
}
