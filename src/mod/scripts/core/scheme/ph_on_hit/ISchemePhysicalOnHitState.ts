import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import type { PhysicalOnHitManager } from "@/mod/scripts/core/scheme/ph_on_hit/PhysicalOnHitManager";

/**
 * todo;
 */
export interface ISchemePhysicalOnHitState extends IBaseSchemeState {
  action: PhysicalOnHitManager;
}
