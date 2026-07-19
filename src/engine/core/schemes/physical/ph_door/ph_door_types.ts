import type { LuaArray, Nillable, TLabel } from "xray16/lib";

import type { IBoneStateDescriptor, IConfigSwitchConditionsDescriptor } from "@/engine/core/ini";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * State of door scheme.
 */
export interface ISchemePhysicalDoorState extends IBaseSchemeState {
  closed: boolean;
  locked: boolean;
  noForce: boolean;
  notForNpc: boolean;
  showTips: boolean;
  tipOpen: Nillable<TLabel>;
  tipUnlock: TLabel;
  tipClose: TLabel;
  slider: boolean;
  sndOpenStart: Nillable<string>;
  sndCloseStart: Nillable<string>;
  sndCloseStop: string;
  scriptUsedMoreThanOnce: Nillable<boolean>;
  onUse: Nillable<IConfigSwitchConditionsDescriptor>;
  hitOnBone: LuaArray<IBoneStateDescriptor>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.PH_DOOR]: ISchemePhysicalDoorState;
  }
}
