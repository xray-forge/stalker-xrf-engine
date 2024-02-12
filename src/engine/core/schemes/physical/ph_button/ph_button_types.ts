import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IConfigSwitchConditionsDescriptor } from "@/engine/core/utils/ini";
import { Optional, TLabel } from "@/engine/lib/types";

/**
 * State of button logics implementing scheme.
 */
export interface ISchemePhysicalButtonState extends IBaseSchemeState {
  onPress: Optional<IConfigSwitchConditionsDescriptor>;
  tooltip: Optional<TLabel>;
  anim: TLabel;
  blending: boolean;
}
