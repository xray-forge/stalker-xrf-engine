import type { Nillable, TNumberId } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";

/**
 * State of monster death scheme.
 */
export interface ISchemeMobDeathState extends IBaseSchemeState {
  killerId: Nillable<TNumberId>;
}
