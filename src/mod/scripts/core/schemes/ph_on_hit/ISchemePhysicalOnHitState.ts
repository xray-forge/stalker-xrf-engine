import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import type { PhysicalHitManager } from "@/mod/scripts/core/schemes/ph_on_hit/PhysicalHitManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnHitState extends IBaseSchemeState {
  action: PhysicalHitManager;
}
