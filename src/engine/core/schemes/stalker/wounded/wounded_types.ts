import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import type { TConditionList } from "@/engine/core/utils/ini";
import type { LuaArray, Optional, TDistance, TSection, TStringId } from "@/engine/lib/types";

export const PS_BEGIN_WOUNDED: TStringId = "begin_wounded";

export const PS_WOUNDED_STATE: TStringId = "wounded_state";

export const PS_WOUNDED_SOUND: TStringId = "wounded_sound";

export const PS_WOUNDED_FIGHT: TStringId = "wounded_fight";

export const PS_WOUNDED_VICTIM: TStringId = "wounded_victim";

/**
 * Descriptor of wounded state configuration parameters.
 */
export interface IWoundedStateDescriptor {
  // Health breakpoint to apply state descriptor.
  hp: Optional<TDistance>;
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
  helpDialog: Optional<TStringId>;
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
