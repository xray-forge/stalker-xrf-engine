import { IAnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { addObject, deleteObject } from "@/mod/scripts/core/db/objects";
import { registry } from "@/mod/scripts/core/db/registry";

/**
 * todo;
 */
export function addAnomaly(anomaly: IAnomalyZoneBinder): void {
  registry.anomalies.set(anomaly.object.name(), anomaly);
  addObject(anomaly.object);
}

/**
 * todo;
 */
export function deleteAnomaly(anomaly: IAnomalyZoneBinder): void {
  registry.anomalies.delete(anomaly.object.name());
  deleteObject(anomaly.object);
}
