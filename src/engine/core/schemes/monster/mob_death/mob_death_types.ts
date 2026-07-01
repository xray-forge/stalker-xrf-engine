import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { Nillable, TNumberId } from "@/engine/lib/types";

/**
 * State of monster death scheme.
 */
export interface ISchemeMobDeathState extends IBaseSchemeState {
  killerId: Nillable<TNumberId>;
}
