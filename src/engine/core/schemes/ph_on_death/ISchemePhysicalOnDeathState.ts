import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { PhysicalDeathManager } from "@/engine/core/schemes/ph_on_death/PhysicalDeathManager";

/**
 * State descriptor to handle death logics for physical objects.
 */
export interface ISchemePhysicalOnDeathState extends IBaseSchemeState {
  action: PhysicalDeathManager;
}
