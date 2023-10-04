import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { IConfigSwitchConditionsDescriptor } from "@/engine/core/utils/ini/ini_types";
import { Optional, TLabel } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalButtonState extends IBaseSchemeState {
  onPress: Optional<IConfigSwitchConditionsDescriptor>;
  tooltip: Optional<TLabel>;
  anim: TLabel;
  blending: boolean;
}
