import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IBoneStateDescriptor, IConfigSwitchConditionsDescriptor } from "@/engine/core/utils/ini/ini_types";
import type { LuaArray, Optional, TLabel } from "@/engine/lib/types";

/**
 * State of door scheme.
 */
export interface ISchemePhysicalDoorState extends IBaseSchemeState {
  closed: boolean;
  locked: boolean;
  noForce: boolean;
  notForNpc: boolean;
  showTips: boolean;
  tipOpen: Optional<TLabel>;
  tipUnlock: TLabel;
  tipClose: TLabel;
  slider: boolean;
  sndOpenStart: Optional<string>;
  sndCloseStart: Optional<string>;
  sndCloseStop: string;
  scriptUsedMoreThanOnce: Optional<boolean>;
  onUse: Optional<IConfigSwitchConditionsDescriptor>;
  hitOnBone: LuaArray<IBoneStateDescriptor>;
}
