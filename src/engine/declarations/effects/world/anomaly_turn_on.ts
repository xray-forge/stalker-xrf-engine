import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TName, TRUE, TStringifiedBoolean } from "xray16/lib";

import type { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registry } from "@/engine/core/database";

/**
 * Toggle anomaly zone enabled state as ON.
 *
 * Where:
 * - zoneName - name of anomaly binding object to turn on
 * - isForced - flag to determine whether artefacts should be respawned.
 */
extern(
  "xr_effects.anomaly_turn_on",
  (_: GameObject, __: GameObject, [zoneName, isForced]: [TName, Nillable<TStringifiedBoolean>]): void => {
    const zone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(zoneName);

    assert(zone, "No anomaly zone with name '%s' defined.", zoneName);

    zone.turnOn(isForced === TRUE);
  }
);
