import { XR_game_object } from "xray16";

import { addObject, deleteObject } from "@/mod/scripts/core/db/objects";
import { registry } from "@/mod/scripts/core/db/registry";

export function addActor(object: XR_game_object): void {
  registry.actor = object;
  addObject(object);
}

export function deleteActor(): void {
  deleteObject(registry.actor);
  registry.actor = null as unknown as XR_game_object;
}
