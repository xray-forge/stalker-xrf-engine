import type { PhysicalOnHitController } from "@/engine/core/schemes/physical/ph_on_hit/PhysicalOnHitController";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * State descriptor for physical hits handling scheme.
 */
export interface ISchemePhysicalOnHitState extends IBaseSchemeState {
  action: PhysicalOnHitController;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.PH_ON_HIT]: ISchemePhysicalOnHitState;
  }
}
