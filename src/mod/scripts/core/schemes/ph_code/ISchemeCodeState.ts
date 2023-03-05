import { LuaArray, Optional, TLabel, TName } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { IConfigSwitchCondition, TConditionList } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeCodeState extends IBaseSchemeState {
  tips: TLabel;
  code: Optional<number>;
  on_code: Optional<{ name: TName; condlist: LuaArray<IConfigSwitchCondition> }>;
  on_check_code: LuaTable<TName, TConditionList>;
}
