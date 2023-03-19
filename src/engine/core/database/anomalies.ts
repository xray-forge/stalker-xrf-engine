import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { AnomalyZoneBinder } from "@/engine/core/objects/binders/AnomalyZoneBinder";

/**
 * todo;
 */
export function registerAnomaly(anomaly: AnomalyZoneBinder): void {
  registry.anomalies.set(anomaly.object.name(), anomaly);
  registerObject(anomaly.object);
}

/**
 * todo;
 */
export function unregisterAnomaly(anomaly: AnomalyZoneBinder): void {
  registry.anomalies.delete(anomaly.object.name());
  unregisterObject(anomaly.object);
}
