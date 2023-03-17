import type { Optional, TName, TNumberId } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import type { TConditionList } from "@/engine/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeDeathState extends IBaseSchemeState {
  info: Optional<TConditionList>;
  info2: Optional<TConditionList>;
  killer: Optional<TNumberId>;
  killer_name: Optional<TName>;
}
