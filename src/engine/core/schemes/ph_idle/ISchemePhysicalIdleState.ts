import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes/base";
import type { TConditionList } from "@/engine/core/utils/ini/types";
import type { LuaArray, Optional, TDistance } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalIdleState extends IBaseSchemeState {
  hit_on_bone: LuaArray<{
    dist: Optional<TDistance>;
    state: Optional<TConditionList>;
  }>;
  nonscript_usable: boolean;
  on_use: Optional<IBaseSchemeLogic>;
  tips: string;
}
