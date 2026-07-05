import type { Nillable, TLabel, TName } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IConfigSwitchConditionsDescriptor, TConditionList } from "@/engine/core/utils/ini";

/**
 * State of code implementing scheme.
 */
export interface ISchemeCodeState extends IBaseSchemeState {
  tips: TLabel;
  code: Nillable<number>;
  onCode: Nillable<IConfigSwitchConditionsDescriptor>;
  onCheckCode: LuaTable<TName, TConditionList>;
}
