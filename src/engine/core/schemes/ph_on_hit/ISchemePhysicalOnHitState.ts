import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { PhysicalOnHitManager } from "@/engine/core/schemes/ph_on_hit/PhysicalOnHitManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnHitState extends IBaseSchemeState {
  action: PhysicalOnHitManager;
}
