import { LuaArray, TCount } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeCrowSpawnerState extends IBaseSchemeState {
  max_crows_on_level: TCount;
  path_table: LuaArray<string>;
}
