import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TName } from "xray16/lib";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import { registry } from "@/engine/core/database";

/**
 * Launch signal rocket by provided name.
 *
 * Where:
 * - name - name of signal light rocket object.
 */
extern("xr_effects.launch_signal_rocket", (_: GameObject, __: GameObject, [name]: [TName]): void => {
  const rocket: Nillable<SignalLightBinder> = registry.signalLights.get(name) as Nillable<SignalLightBinder>;

  if (rocket) {
    rocket.startFly();
  } else {
    abort("No signal rocket with name '%s' on current level.", name);
  }
});
