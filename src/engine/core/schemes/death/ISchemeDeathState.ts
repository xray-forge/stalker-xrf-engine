import type { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import type { TConditionList } from "@/engine/core/utils/ini/ini_types";
import type { Optional, TName, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeDeathState extends IBaseSchemeState {
  info: Optional<TConditionList>;
  info2: Optional<TConditionList>;
  killer: Optional<TNumberId>;
  killer_name: Optional<TName>;
}
