import type { Nillable, TNumberId } from "xray16/lib";

import type { TConditionList } from "@/engine/core/ini";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * Store information about death of an object.
 */
export interface ISchemeDeathState extends IBaseSchemeState {
  /**
   * Condition list to execute on object death event.
   */
  info: Nillable<TConditionList>;
  /**
   * Additional condition list to execute on object death event.
   */
  info2: Nillable<TConditionList>;
  killerId: Nillable<TNumberId>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.DEATH]: ISchemeDeathState;
  }
}
