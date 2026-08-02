import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Whether object is talking.
 */
extern("xr_conditions.npc_talking", (_: GameObject, object: GameObject): boolean => {
  return object.is_talking();
});
