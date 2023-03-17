import { LuaArray, Optional, TLabel, TName } from "@/engine/lib/types";
import { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import { IConfigSwitchCondition } from "@/engine/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemePhysicalButtonState extends IBaseSchemeState {
  on_press: Optional<{ name: TName; condlist: LuaArray<IConfigSwitchCondition> }>;
  tooltip: Optional<TLabel>;
  anim: TLabel;
  blending: boolean;
}
