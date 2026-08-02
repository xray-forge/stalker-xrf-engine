import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Check whether actor is talking right now (dialog window is active).
 */
extern("xr_conditions.talking", (actor: GameObject): boolean => {
  return actor.is_talking();
});
