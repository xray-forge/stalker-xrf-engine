import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import type { TConditionList } from "@/engine/core/utils/ini";
import type { LuaArray, Optional, TDistance, TNumberId, TSection } from "@/engine/lib/types";

/**
 * Descriptor of wounded state configuration parameters.
 */
export interface IWoundedStateDescriptor {
  dist: Optional<TDistance>;
  state: Optional<TConditionList>;
  sound: Optional<TConditionList>;
}

/**
 * State of object wounded scheme.
 * Configures how stalker should behave once it is wounded.
 */
export interface ISchemeWoundedState extends IBaseSchemeState {
  woundManager: WoundManager;
  isWoundedInitialized: boolean;
  isTalkEnabled: boolean;
  // Whether object should not be helped by other stalkers.
  isNotForHelp: Optional<boolean>;
  woundedSection: TSection;
  hpState: LuaArray<IWoundedStateDescriptor>;
  hpStateSee: LuaArray<IWoundedStateDescriptor>;
  hpVictim: LuaArray<IWoundedStateDescriptor>;
  hpCover: LuaArray<IWoundedStateDescriptor>;
  hpFight: LuaArray<IWoundedStateDescriptor>;
  helpStartDialog: Optional<string>;
  psyState: LuaArray<IWoundedStateDescriptor>;
  useMedkit: Optional<boolean>;
  helpDialog: TNumberId;
  autoheal: boolean;
}
