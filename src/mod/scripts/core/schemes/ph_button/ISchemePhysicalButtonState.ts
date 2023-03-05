import { LuaArray, Optional, TLabel, TName } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { IConfigSwitchCondition } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemePhysicalButtonState extends IBaseSchemeState {
  on_press: Optional<{ name: TName; condlist: LuaArray<IConfigSwitchCondition> }>;
  tooltip: TLabel;
  anim: TLabel;
  blending: boolean;
}
