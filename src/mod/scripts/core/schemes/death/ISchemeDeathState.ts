import type { Optional } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import type { TConditionList } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeDeathState extends IBaseSchemeState {
  info: Optional<TConditionList>;
  info2: Optional<TConditionList>;
}
