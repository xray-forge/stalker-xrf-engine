import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TConditionList } from "@/engine/core/utils/ini/ini_types";
import type { Optional, TName, TNumberId } from "@/engine/lib/types";

/**
 * Store information about death of an object.
 */
export interface ISchemeDeathState extends IBaseSchemeState {
  info: Optional<TConditionList>;
  info2: Optional<TConditionList>;
  killerId: Optional<TNumberId>;
  killerName: Optional<TName>;
}
