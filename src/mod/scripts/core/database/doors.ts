import { XR_game_object } from "xray16";

import { registerObject, unregisterObject } from "@/mod/scripts/core/database/objects";
import { registry } from "@/mod/scripts/core/database/registry";
import type { LabX8DoorBinder } from "@/mod/scripts/core/object/binders/LabX8DoorBinder";

/**
 * todo;
 */
export function registerDoorObject(object: XR_game_object, doorBinder: LabX8DoorBinder): void {
  registry.animatedDoors.set(object.name(), doorBinder);
  registerObject(object);
}

/**
 * todo;
 */
export function unregisterDoorObject(object: XR_game_object): void {
  registry.animatedDoors.delete(object.name());
  unregisterObject(object);
}
