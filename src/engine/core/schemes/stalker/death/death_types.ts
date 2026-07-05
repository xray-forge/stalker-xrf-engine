import type { Nillable, TNumberId } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TConditionList } from "@/engine/core/utils/ini";

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
