import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { IConfigSwitchConditionsDescriptor } from "@/engine/core/utils/ini/ini_types";
import { Optional, TLabel } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalButtonState extends IBaseSchemeState {
  on_press: Optional<IConfigSwitchConditionsDescriptor>;
  tooltip: Optional<TLabel>;
  anim: TLabel;
  blending: boolean;
}
