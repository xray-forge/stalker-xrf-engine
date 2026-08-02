import { GameObject, ServerObject } from "xray16/alias";
import { extern, Nillable, TName, TNumberId, TSection } from "xray16/lib";

import { type AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registry } from "@/engine/core/database";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/quests/zaton/zat_b29/advanced_artefacts_data";

/**
 * Check if b29 quest detect that anomalies have artefacts.
 */
extern(
  "xr_conditions.zat_b29_anomaly_has_af",
  (_: GameObject, __: GameObject, [zoneName]: [Nillable<TName>]): boolean => {
    const anomaly: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(zoneName as TName);

    if (!zoneName || !anomaly || anomaly.spawnedArtefactsCount < 1) {
      return false;
    }

    let artefactName: Nillable<TSection> = null;

    for (const index of $range(16, 23)) {
      if (hasInfoPortion(zatB29InfopBringTable.get(index))) {
        artefactName = zatB29AfTable.get(index);
        break;
      }
    }

    // Only artefacts spawned in the checked zone matter, `registry.artefacts.ways` is global.
    for (const [artefactId] of anomaly.artefactPathsByArtefactId) {
      const artefact: Nillable<ServerObject> = registry.simulator.object(tonumber(artefactId) as TNumberId);

      if (artefact && artefact.section_name() === artefactName) {
        giveInfoPortion(zoneName);

        return true;
      }
    }

    return false;
  }
);
