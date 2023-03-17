import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import type { PhysicalDeathManager } from "@/mod/scripts/core/schemes/ph_on_death/PhysicalDeathManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnDeathState extends IBaseSchemeState {
  action: PhysicalDeathManager;
}
