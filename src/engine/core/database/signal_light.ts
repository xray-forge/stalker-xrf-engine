import type { SignalLightBinder } from "@/engine/core/binders/physic";
import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";

/**
 * Register signal light object.
 *
 * @param binder - binder to register
 * @returns registry object for provided binder
 */
export function registerSignalLight(binder: SignalLightBinder): IRegistryObjectState {
  registry.signalLights.set(binder.object.name(), binder);

  return registerObject(binder.object);
}

/**
 * Unregister signal light object.
 *
 * @param binder - binder to unregister
 */
export function unregisterSignalLight(binder: SignalLightBinder): void {
  registry.signalLights.delete(binder.object.name());

  unregisterObject(binder.object);
}
