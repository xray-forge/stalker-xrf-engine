import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { PhysicalOnHitManager } from "@/engine/core/schemes/physical/ph_on_hit/PhysicalOnHitManager";
import type { EScheme } from "@/engine/lib/types";

/**
 * State descriptor for physical hits handling scheme.
 */
export interface ISchemePhysicalOnHitState extends IBaseSchemeState {
  action: PhysicalOnHitManager;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.PH_ON_HIT]: ISchemePhysicalOnHitState;
  }
}
