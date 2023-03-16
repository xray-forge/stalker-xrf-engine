import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import type { PhysicalDeathManager } from "@/mod/scripts/core/scheme/ph_on_death/PhysicalDeathManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnDeathState extends IBaseSchemeState {
  action: PhysicalDeathManager;
}
