import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { PhysicalDeathManager } from "@/engine/core/schemes/ph_on_death/PhysicalDeathManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnDeathState extends IBaseSchemeState {
  action: PhysicalDeathManager;
}
