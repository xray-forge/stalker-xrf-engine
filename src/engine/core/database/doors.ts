import { IRegistryObjectState, registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import type { LabX8DoorBinder } from "@/engine/core/objects/binders/physic/LabX8DoorBinder";

/**
 * Register door binder object.
 */
export function registerDoor(doorBinder: LabX8DoorBinder): IRegistryObjectState {
  registry.doors.set(doorBinder.object.name(), doorBinder);

  return registerObject(doorBinder.object);
}

/**
 * Unregister door binder object.
 */
export function unregisterDoor(doorBinder: LabX8DoorBinder): void {
  registry.doors.delete(doorBinder.object.name());
  unregisterObject(doorBinder.object);
}
