import { setPortableStoreValue } from "@/engine/core/database/portable_store";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { HELPING_WOUNDED_OBJECT_KEY } from "@/engine/lib/constants/portable_store_keys";
import { ClientObject, Optional, TNumberId } from "@/engine/lib/types";

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

/**
 * Register object as wounded so others can detect it for searching and helping.
 *
 * @param object - client object to register as wounded
 */
export function registerWoundedObject(object: ClientObject): void {
  const objectId: TNumberId = object.id();

  registry.objectsWounded.set(objectId, registry.objects.get(objectId));
}

/**
 * Unregister object as wounded so others will not detect it for helping.
 *
 * @param object - client object to unregister
 */
export function unRegisterWoundedObject(object: ClientObject): void {
  setPortableStoreValue(object.id(), HELPING_WOUNDED_OBJECT_KEY, null);
  registry.objectsWounded.delete(object.id());
}
