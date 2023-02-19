import { XR_game_object } from "xray16";

import { registry } from "@/mod/scripts/core/db/registry";

/**
 * todo;
 */
export function addObject(object: XR_game_object): void {
  registry.objects.get(object.id()).object = object;
}

/**
 * todo;
 */
export function deleteObject(object: XR_game_object): void {
  registry.objects.delete(object.id());
}
