import { XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database/registry";

/**
 * todo;
 */
export function addObject(object: XR_game_object): IStoredObject {
  const stored: Optional<IStoredObject> = registry.objects.get(object.id());

  if (stored === null) {
    const newRecord: IStoredObject = { object: object };

    registry.objects.set(object.id(), newRecord);

    return newRecord;
  } else {
    stored.object = object;

    return stored;
  }
}

/**
 * todo;
 */
export function deleteObject(object: XR_game_object): void {
  registry.objects.delete(object.id());
}

/**
 * todo;
 */
export function resetObject(object: XR_game_object, record: Partial<IStoredObject> = {}): IStoredObject {
  record.object = object;
  registry.objects.set(object.id(), record);

  return record;
}
