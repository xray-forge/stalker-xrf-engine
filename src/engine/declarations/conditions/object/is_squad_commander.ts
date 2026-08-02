import { AnyGameObject, GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isObjectSquadCommander } from "@/engine/core/utils/squad";

/**
 * Check whether the object is the commander of its squad.
 *
 * @param _ - Actor game object, not used.
 * @param object - Game object to check for squad commander status.
 * @returns Whether the object is the commander of its squad.
 */
extern("xr_conditions.is_squad_commander", (_: GameObject, object: AnyGameObject): boolean => {
  return isObjectSquadCommander(object);
});
