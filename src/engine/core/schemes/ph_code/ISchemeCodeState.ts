import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { IConfigSwitchCondition, TConditionList } from "@/engine/core/utils/parse";
import { LuaArray, Optional, TLabel, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeCodeState extends IBaseSchemeState {
  tips: TLabel;
  code: Optional<number>;
  on_code: Optional<{ name: TName; condlist: LuaArray<IConfigSwitchCondition> }>;
  on_check_code: LuaTable<TName, TConditionList>;
}
