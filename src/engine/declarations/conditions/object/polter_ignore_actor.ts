import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Check if poltergeist has actor ignoring enabled.
 */
extern("xr_conditions.polter_ignore_actor", (_: GameObject, object: GameObject): boolean => {
  return object.poltergeist_get_actor_ignore();
});
