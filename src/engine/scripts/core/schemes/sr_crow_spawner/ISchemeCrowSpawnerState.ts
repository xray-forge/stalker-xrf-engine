import { LuaArray, TCount } from "@/engine/lib/types";
import { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeCrowSpawnerState extends IBaseSchemeState {
  max_crows_on_level: TCount;
  path_table: LuaArray<string>;
}
