import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { LuaArray, TCount } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeCrowSpawnerState extends IBaseSchemeState {
  max_crows_on_level: TCount;
  path_table: LuaArray<string>;
}
