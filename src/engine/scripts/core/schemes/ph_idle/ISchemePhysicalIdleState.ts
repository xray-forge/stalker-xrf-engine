import type { LuaArray, Optional, TDistance, TName } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import type { TConditionList } from "@/engine/scripts/utils/parse";

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
