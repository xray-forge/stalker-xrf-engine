import { XR_game_object } from "xray16";

import { registerObject, unregisterObject } from "@/mod/scripts/core/database/objects";
import { registry } from "@/mod/scripts/core/database/registry";

/**
 * todo;
 */
export function registerActor(object: XR_game_object): void {
  registry.actor = object;
  registerObject(object);
}

/**
 * todo;
 */
export function unregisterActor(): void {
  unregisterObject(registry.actor);
  registry.actor = null as unknown as XR_game_object;
}
