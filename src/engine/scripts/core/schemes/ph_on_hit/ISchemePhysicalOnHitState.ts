import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import type { PhysicalOnHitManager } from "@/engine/scripts/core/schemes/ph_on_hit/PhysicalOnHitManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnHitState extends IBaseSchemeState {
  action: PhysicalOnHitManager;
}
