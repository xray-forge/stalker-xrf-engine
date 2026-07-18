import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { PhysicalDeathManager } from "@/engine/core/schemes/physical/ph_on_death/PhysicalDeathManager";
import type { EScheme } from "@/engine/lib/types";

/**
 * State descriptor to handle death logics for physical objects.
 */
export interface ISchemePhysicalOnDeathState extends IBaseSchemeState {
  action: PhysicalDeathManager;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.PH_ON_DEATH]: ISchemePhysicalOnDeathState;
  }
}
