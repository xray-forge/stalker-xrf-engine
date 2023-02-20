import { XR_game_object } from "xray16";

import type { ILabX8DoorBinder } from "@/mod/scripts/core/binders/LabX8DoorBinder";
import { addObject, deleteObject } from "@/mod/scripts/core/db/objects";
import { registry } from "@/mod/scripts/core/db/registry";

/**
 * todo;
 */
export function addDoorObject(object: XR_game_object, doorBinder: ILabX8DoorBinder): void {
  registry.animatedDoors.set(object.name(), doorBinder);
  addObject(object);
}

/**
 * todo;
 */
export function deleteDoorObject(object: XR_game_object): void {
  registry.animatedDoors.delete(object.name());
  deleteObject(object);
}
