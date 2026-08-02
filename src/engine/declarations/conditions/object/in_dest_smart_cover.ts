import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Whether object is in smart cover.
 */
extern("xr_conditions.in_dest_smart_cover", (_: GameObject, object: GameObject): boolean => {
  return object.in_smart_cover();
});
