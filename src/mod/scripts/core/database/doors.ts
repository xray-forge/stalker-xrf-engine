import { XR_game_object } from "xray16";

import type { LabX8DoorBinder } from "@/mod/scripts/core/binders/LabX8DoorBinder";
import { registerObject, unregisterObject } from "@/mod/scripts/core/database/objects";
import { registry } from "@/mod/scripts/core/database/registry";

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
