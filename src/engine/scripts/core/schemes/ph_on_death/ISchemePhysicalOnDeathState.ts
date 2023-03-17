import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import type { PhysicalDeathManager } from "@/engine/scripts/core/schemes/ph_on_death/PhysicalDeathManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnDeathState extends IBaseSchemeState {
  action: PhysicalDeathManager;
}
