import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IConfigSwitchConditionsDescriptor, TConditionList } from "@/engine/core/utils/ini/ini_types";
import type { Optional, TLabel, TName } from "@/engine/lib/types";

/**
 * State of code implementing scheme.
 */
export interface ISchemeCodeState extends IBaseSchemeState {
  tips: TLabel;
  code: Optional<number>;
  onCode: Optional<IConfigSwitchConditionsDescriptor>;
  onCheckCode: LuaTable<TName, TConditionList>;
}
