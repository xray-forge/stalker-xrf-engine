import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";
import { AnomalyFieldBinder } from "@/engine/core/objects";
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

/**
 * todo;
 */
export function registerAnomalyField(anomalyField: AnomalyFieldBinder): void {
  registerZone(anomalyField.object);
  registry.anomalyFields.set(anomalyField.object.name(), anomalyField);
}

/**
 * todo;
 */
export function unregisterAnomalyField(anomalyField: AnomalyFieldBinder): void {
  unregisterZone(anomalyField.object);
  registry.anomalyFields.delete(anomalyField.object.name());
}
