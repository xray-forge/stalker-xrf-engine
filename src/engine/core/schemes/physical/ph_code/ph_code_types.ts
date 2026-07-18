import type { Nillable, TLabel, TName } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { IConfigSwitchConditionsDescriptor, TConditionList } from "@/engine/core/utils/ini";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of code implementing scheme.
 */
export interface ISchemeCodeState extends IBaseSchemeState {
  tips: TLabel;
  code: Nillable<number>;
  onCode: Nillable<IConfigSwitchConditionsDescriptor>;
  onCheckCode: LuaTable<TName, TConditionList>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.PH_CODE]: ISchemeCodeState;
  }
}
