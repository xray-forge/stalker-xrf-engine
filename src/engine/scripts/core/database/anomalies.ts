import { registerObject, unregisterObject } from "@/engine/scripts/core/database/objects";
import { registry } from "@/engine/scripts/core/database/registry";
import { AnomalyZoneBinder } from "@/engine/scripts/core/objects/binders/AnomalyZoneBinder";

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
