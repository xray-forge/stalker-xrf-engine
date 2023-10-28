import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { registry } from "@/engine/core/database";
import { LuaArray, Optional, ServerObject, TName, TSection } from "@/engine/lib/types";

/**
 * @param anomalyZoneName - name of anomaly zone to check
 * @param artefactSection - name of artefact to search in the anomaly
 * @returns whether anomaly has artefact
 */
export function anomalyHasArtefact(anomalyZoneName: TName, artefactSection: TSection): boolean {
  const anomalyZone: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(anomalyZoneName);

  if (!anomalyZone || anomalyZone.spawnedArtefactsCount < 1) {
    return false;
  }

  for (const [artefactId] of anomalyZone.artefactWaysByArtefactId) {
    const object: Optional<ServerObject> = registry.simulator.object(artefactId);

    if (object && object.section_name() === artefactSection) {
      return true;
    }
  }

  return false;
}

/**
 * @param anomalyZoneName - name of anomaly zone to check
 * @returns list of artefacts in the anomaly
 */
export function getAnomalyArtefacts(anomalyZoneName: TName): LuaArray<TSection> {
  const anomalyZone: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(anomalyZoneName);
  const artefactsList: LuaArray<TName> = new LuaTable();

  if (!anomalyZone || anomalyZone.spawnedArtefactsCount < 1) {
    return artefactsList;
  }

  for (const [artefactId] of anomalyZone.artefactWaysByArtefactId) {
    const artefactObject: Optional<ServerObject> = registry.simulator.object(artefactId);

    if (artefactObject) {
      table.insert(artefactsList, artefactObject.section_name());
    }
  }

  return artefactsList;
}
