import { GameObject } from "xray16/alias";

import { boxConfig } from "@/engine/core/managers/box/BoxConfig";

/**
 * @param object - Game object to check.
 * @returns Whether provided object is visually expected to be breakable box.
 */
export function isBoxObject(object: GameObject): boolean {
  return boxConfig.LOOT_BOX_VISUALS.has(object.get_visual_name());
}
