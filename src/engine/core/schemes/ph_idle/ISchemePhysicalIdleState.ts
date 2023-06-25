import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes/base";
import type { IBoneStateDescriptor } from "@/engine/core/utils/ini/types";
import type { LuaArray, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalIdleState extends IBaseSchemeState {
  hit_on_bone: LuaArray<IBoneStateDescriptor>;
  nonscript_usable: boolean;
  on_use: Optional<IBaseSchemeLogic>;
  tips: string;
}
