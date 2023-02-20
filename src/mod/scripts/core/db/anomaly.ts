import { IAnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { addObject, deleteObject, registry } from "@/mod/scripts/core/db/index";

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
