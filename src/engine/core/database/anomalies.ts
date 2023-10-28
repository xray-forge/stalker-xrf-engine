import { AnomalyFieldBinder, AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";

/**
 * Register anomaly zone object binder.
 *
 * @param anomalyZone - anomaly object binder
 * @returns object registry state representation
 */
export function registerAnomalyZone(anomalyZone: AnomalyZoneBinder): IRegistryObjectState {
  registry.anomalyZones.set(anomalyZone.object.name(), anomalyZone);

  return registerObject(anomalyZone.object);
}

/**
 * Unregister anomaly zone object binder.
 *
 * @param anomalyZone - anomaly object binder
 */
export function unregisterAnomalyZone(anomalyZone: AnomalyZoneBinder): void {
  registry.anomalyZones.delete(anomalyZone.object.name());
  unregisterObject(anomalyZone.object);
}

/**
 * Register anomaly field object binder.
 *
 * @param anomalyField - anomaly field object binder
 * @returns object registry state representation
 */
export function registerAnomalyField(anomalyField: AnomalyFieldBinder): IRegistryObjectState {
  registry.anomalyFields.set(anomalyField.object.name(), anomalyField);

  return registerZone(anomalyField.object);
}

/**
 * Unregister anomaly field object binder.
 *
 * @param anomalyField - anomaly field object binder
 */
export function unregisterAnomalyField(anomalyField: AnomalyFieldBinder): void {
  unregisterZone(anomalyField.object);
  registry.anomalyFields.delete(anomalyField.object.name());
}
