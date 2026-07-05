import type { LuaArray, Nillable, TLabel } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IBoneStateDescriptor, IConfigSwitchConditionsDescriptor } from "@/engine/core/utils/ini";

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
