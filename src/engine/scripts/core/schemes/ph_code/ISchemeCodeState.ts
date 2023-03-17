import { LuaArray, Optional, TLabel, TName } from "@/engine/lib/types";
import { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import { IConfigSwitchCondition, TConditionList } from "@/engine/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeCodeState extends IBaseSchemeState {
  tips: TLabel;
  code: Optional<number>;
  on_code: Optional<{ name: TName; condlist: LuaArray<IConfigSwitchCondition> }>;
  on_check_code: LuaTable<TName, TConditionList>;
}
