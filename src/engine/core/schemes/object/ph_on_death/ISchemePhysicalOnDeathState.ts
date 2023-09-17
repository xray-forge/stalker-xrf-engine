import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { PhysicalDeathManager } from "@/engine/core/schemes/object/ph_on_death/PhysicalDeathManager";

/**
 * State descriptor to handle death logics for physical objects.
 */
export interface ISchemePhysicalOnDeathState extends IBaseSchemeState {
  action: PhysicalDeathManager;
}
