import { Nillable, TLabel } from "xray16/lib";

import type { IConfigSwitchConditionsDescriptor } from "@/engine/core/ini";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * State of button logics implementing scheme.
 */
export interface ISchemePhysicalButtonState extends IBaseSchemeState {
  onPress: Nillable<IConfigSwitchConditionsDescriptor>;
  tooltip: Nillable<TLabel>;
  anim: TLabel;
  blending: boolean;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.PH_BUTTON]: ISchemePhysicalButtonState;
  }
}
