import { Nillable, TLabel } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IConfigSwitchConditionsDescriptor } from "@/engine/core/utils/ini";

/**
 * State of button logics implementing scheme.
 */
export interface ISchemePhysicalButtonState extends IBaseSchemeState {
  onPress: Nillable<IConfigSwitchConditionsDescriptor>;
  tooltip: Nillable<TLabel>;
  anim: TLabel;
  blending: boolean;
}
