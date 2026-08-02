import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TName } from "xray16/lib";

import type { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registry } from "@/engine/core/database";

/**
 * Toggle anomaly zone enabled state as OFF.
 *
 * Where:
 * - zoneName - name of anomaly binding object to turn off.
 */
extern("xr_effects.anomaly_turn_off", (_: GameObject, __: GameObject, [zoneName]: [TName]): void => {
  const zone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(zoneName);

  assert(zone, "No anomaly zone with name '%s' defined.", zoneName);

  zone.turnOff();
});
