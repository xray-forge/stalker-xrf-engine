import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { registry } from "@/engine/core/database";
import { LuaArray, Optional, ServerObject, TName, TSection } from "@/engine/lib/types";

/**
 * @param name - name of anomaly zone to check
 * @param section - name of artefact to search in the anomaly
 * @returns whether anomaly has artefact
 */
export function anomalyHasArtefact(name: TName, section: TSection): boolean {
  const zone: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(name);

  if (!zone || zone.spawnedArtefactsCount < 1) {
    return false;
  }

  for (const [id] of zone.artefactWaysByArtefactId) {
    const object: Optional<ServerObject> = registry.simulator.object(id);

    if (object && object.section_name() === section) {
      return true;
    }
  }

  return false;
}

/**
 * @param name - name of anomaly zone to check
 * @returns list of artefacts in the anomaly
 */
export function getAnomalyArtefacts(name: TName): LuaArray<TSection> {
  const zone: Optional<AnomalyZoneBinder> = registry.anomalyZones.get(name);
  const artefacts: LuaArray<TName> = new LuaTable();

  if (!zone || zone.spawnedArtefactsCount < 1) {
    return artefacts;
  }

  for (const [id] of zone.artefactWaysByArtefactId) {
    const object: Optional<ServerObject> = registry.simulator.object(id);

    if (object) {
      table.insert(artefacts, object.section_name());
    }
  }

  return artefacts;
}
