import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { IConfigSwitchConditionsDescriptor, TConditionList } from "@/engine/core/utils/ini/ini_types";
import type { Optional, TLabel, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeCodeState extends IBaseSchemeState {
  tips: TLabel;
  code: Optional<number>;
  on_code: Optional<IConfigSwitchConditionsDescriptor>;
  on_check_code: LuaTable<TName, TConditionList>;
}
