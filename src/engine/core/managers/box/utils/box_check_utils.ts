import { boxConfig } from "@/engine/core/managers/box/BoxConfig";
import { GameObject } from "@/engine/lib/types";

/**
 * @param object - Game object to check.
 * @returns Whether provided object is visually expected to be breakable box.
 */
export function isBoxObject(object: GameObject): boolean {
  return boxConfig.LOOT_BOX_VISUALS.has(object.get_visual_name());
}
