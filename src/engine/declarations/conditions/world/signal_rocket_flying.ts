import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TName } from "xray16/lib";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import { registry } from "@/engine/core/database";

/**
 * Check whether surge signal rockets flying.
 *
 * Where:
 * - name - name of signal light to check flying state.
 *
 * Throws, if signal rocket is not found.
 */
extern("xr_conditions.signal_rocket_flying", (_: GameObject, __: GameObject, [name]: [TName]): boolean => {
  const rocket: Nillable<SignalLightBinder> = registry.signalLights.get(name) as Nillable<SignalLightBinder>;

  if (!rocket) {
    abort("No such signal rocket: '%s' on the level.", name);
  }

  return rocket.isFlying();
});
