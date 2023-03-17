import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import type { PhysicalOnHitManager } from "@/mod/scripts/core/schemes/ph_on_hit/PhysicalOnHitManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnHitState extends IBaseSchemeState {
  action: PhysicalOnHitManager;
}
