import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { IConfigSwitchCondition } from "@/engine/core/utils/parse";
import { LuaArray, Optional, TLabel, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalButtonState extends IBaseSchemeState {
  on_press: Optional<{ name: TName; condlist: LuaArray<IConfigSwitchCondition> }>;
  tooltip: Optional<TLabel>;
  anim: TLabel;
  blending: boolean;
}
