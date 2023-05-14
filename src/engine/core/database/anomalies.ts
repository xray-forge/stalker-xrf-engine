import { IRegistryObjectState, registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";
import { AnomalyFieldBinder } from "@/engine/core/objects";
import { AnomalyZoneBinder } from "@/engine/core/objects/binders/zones/AnomalyZoneBinder";

/**
 * Register anomaly zone object binder.
 */
export function registerAnomalyZone(anomaly: AnomalyZoneBinder): IRegistryObjectState {
  registry.anomalyZones.set(anomaly.object.name(), anomaly);

  return registerObject(anomaly.object);
}

/**
 * Unregister anomaly zone object binder.
 */
export function unregisterAnomalyZone(anomaly: AnomalyZoneBinder): void {
  registry.anomalyZones.delete(anomaly.object.name());
  unregisterObject(anomaly.object);
}

/**
 * Register anomaly field object binder.
 */
export function registerAnomalyField(anomalyField: AnomalyFieldBinder): IRegistryObjectState {
  registry.anomalyFields.set(anomalyField.object.name(), anomalyField);

  return registerZone(anomalyField.object);
}

/**
 * Unregister anomaly field object binder.
 */
export function unregisterAnomalyField(anomalyField: AnomalyFieldBinder): void {
  unregisterZone(anomalyField.object);
  registry.anomalyFields.delete(anomalyField.object.name());
}
