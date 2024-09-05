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
  woundedSection: TSection;
  helpStartDialog: Optional<string>;
  helpDialog: TNumberId;
  canUseMedkit: Optional<boolean>;
  isWoundedInitialized: boolean;
  isTalkEnabled: boolean;
  // Whether object should not be helped by other stalkers.
  isNotForHelp: Optional<boolean>;
  // Whether object can auto-heal after certain timeout.
  isAutoHealing: boolean;
  // States and sounds for wound handling.
  hpState: LuaArray<IWoundedStateDescriptor>;
  // States and sounds for wound handling.
  hpStateSee: LuaArray<IWoundedStateDescriptor>;
  // States and sounds for wound handling.
  hpVictim: LuaArray<IWoundedStateDescriptor>;
  // States and sounds for wound handling.
  hpCover: LuaArray<IWoundedStateDescriptor>;
  // States and sounds for wound handling.
  hpFight: LuaArray<IWoundedStateDescriptor>;
  // States and sounds for wound handling.
  psyState: LuaArray<IWoundedStateDescriptor>;
}
