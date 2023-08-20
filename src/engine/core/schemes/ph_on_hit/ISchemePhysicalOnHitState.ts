import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { PhysicalOnHitManager } from "@/engine/core/schemes/ph_on_hit/PhysicalOnHitManager";

/**
 * State descriptor for physical hits handling scheme.
 */
export interface ISchemePhysicalOnHitState extends IBaseSchemeState {
  action: PhysicalOnHitManager;
}
