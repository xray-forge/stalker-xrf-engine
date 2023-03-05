import type { LuaArray, Optional, TDistance, TName } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import type { TConditionList } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemePhysicalIdleState extends IBaseSchemeState {
  hit_on_bone: LuaArray<{
    dist: Optional<TDistance>;
    state: Optional<TConditionList>;
  }>;
  nonscript_usable: boolean;
  on_use: Optional<{ name: TName; condlist: TConditionList }>;
  tips: string;
}
