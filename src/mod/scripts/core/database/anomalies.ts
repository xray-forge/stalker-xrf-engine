import { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { addObject, deleteObject } from "@/mod/scripts/core/database/objects";
import { registry } from "@/mod/scripts/core/database/registry";

/**
 * todo;
 */
export function addAnomaly(anomaly: AnomalyZoneBinder): void {
  registry.anomalies.set(anomaly.object.name(), anomaly);
  addObject(anomaly.object);
}

/**
 * todo;
 */
export function deleteAnomaly(anomaly: AnomalyZoneBinder): void {
  registry.anomalies.delete(anomaly.object.name());
  deleteObject(anomaly.object);
}
