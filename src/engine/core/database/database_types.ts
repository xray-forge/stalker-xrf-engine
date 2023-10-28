import { StalkerPatrolManager } from "@/engine/core/objects/ai/patrol/StalkerPatrolManager";
import { ObjectRestrictionsManager } from "@/engine/core/objects/ai/restriction";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { IActionSchemeHearState } from "@/engine/core/schemes/shared/hear";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/stalker/combat_idle/combat_idle_types";
import { TConditionList } from "@/engine/core/utils/ini";
import {
  AnyObject,
  EScheme,
  ESchemeType,
  GameObject,
  IniFile,
  LuaArray,
  Optional,
  TDuration,
  Time,
  TName,
  TNumberId,
  TRate,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

/**
 * todo;
 */
export interface IBaseSchemeLogic {
  name: TName;
  condlist: TConditionList;
  objectId: Optional<TNumberId>;
  p1: Optional<string | number>;
  p2: Optional<string | number>;
}

/**
 * List of scheme logics signal.
 * Used to set / check in some script scenarios.
 */
export type TSchemeSignals = LuaTable<TName, boolean>;

/**
 * todo;
 */
export interface IBaseSchemeState {
  ini: IniFile;
  /**
   * List of switch conditions.
   * Based on logic check one scheme section can be switched to another if condlists provide next section.
   */
  logic: Optional<LuaArray<IBaseSchemeLogic>>;
  /**
   * List of signals in active scheme state.
   * Signals are flags indicating whether some action/thing happened.
   */
  signals: Optional<TSchemeSignals>;
  scheme: EScheme;
  section: Optional<TSection>;
  actions?: LuaTable<AnyObject, boolean>;
  overrides: Optional<ILogicsOverrides>;
}

/**
 * Client objects registry state logics descriptor.
 */
export interface IRegistryObjectStateLogic {
  /**
   * State logic containing ini file.
   */
  ini: IniFile;
  /**
   * File name of state logic ini.
   */
  iniFilename: Optional<TName>;
  /**
   * Based on object type, marks compatible scheme types.
   */
  schemeType: ESchemeType;
  /**
   * Currently active logic section of the object.
   */
  activeSection: Optional<TSection>;
  /**
   * Currently active logic scheme of the object.
   */
  activeScheme: Optional<EScheme>;
  /**
   * Describes INI file section with initial logic.
   * By default, it is `logic` or smart terrain job section name.
   */
  sectionLogic: Optional<TName>;
  /**
   * Object smart terrain name.
   * Used as base for schemes to pick up logic when smart terrains are capturing objects/squads.
   * Having smart terrain allows selecting generic schemes defined for smart terrain.
   */
  smartTerrainName: Optional<TName>;
  /**
   * todo;
   */
  overrides: Optional<ILogicsOverrides>;
  /**
   * Time of logics section activation - absolute.
   */
  activationTime: TTimestamp;
  /**
   * Time of logics section activation - in-game time.
   */
  activationGameTime: Time;
  /**
   * Assigned job ini file from parent smart terrain object.
   */
  jobIni: Optional<TName>;
  /**
   * Describes last active logic file name when game was saved.
   */
  loadedIniFilename: Optional<TName>;
  /**
   * Describes last active section logic section, source of initial object logic when game was saved.
   */
  loadedSectionLogic: Optional<TSection>;
  /**
   * Describes last active logic section when game was saved.
   */
  loadedActiveSection: Optional<TSection>;
  /**
   * Describes last active smart terrain name when game was saved.
   */
  loadedSmartTerrainName: Optional<TName>;
}

/**
 * State logics overrides descriptor.
 */
export interface ILogicsOverrides {
  heliHunter: Optional<TConditionList>;
  combatIgnore: Optional<IBaseSchemeLogic>;
  combatIgnoreKeepWhenAttacked: Optional<boolean>;
  combatType: Optional<IBaseSchemeLogic>;
  scriptCombatType: Optional<TName>;
  minPostCombatTime: TDuration;
  maxPostCombatTime: TDuration;
  onCombat: Optional<IBaseSchemeLogic>;
  onOffline: Optional<TConditionList>;
  soundgroup: Optional<TName>;
}

/**
 * Client objects registry state describing logics and state.
 */
export interface IRegistryObjectState extends Record<EScheme, Optional<IBaseSchemeState>>, IRegistryObjectStateLogic {
  /**
   * Client object reference to owner of the registry state.
   */
  object: GameObject;
  /**
   * Dynamically stored flags / variables.
   */
  portableStore: Optional<LuaTable<TName>>;
  /**
   * Patrol manager for stalker objects.
   * Handles patrol selection/logics/waypoints etc.
   */
  patrolManager: Optional<StalkerPatrolManager>;
  /**
   * State manager class for stalker objects.
   * Handles current animation/animstate logics and adjust stalker object to match required logics.
   */
  stateManager: Optional<StalkerStateManager>;
  /**
   * todo;
   */
  restrictionsManager: Optional<ObjectRestrictionsManager>;
  /**
   * todo;
   */
  hearInfo: Optional<IActionSchemeHearState>;
  /**
   * todo;
   */
  invulnerable: Optional<boolean>;
  /**
   * todo;
   */
  immortal: Optional<boolean>;
  /**
   * todo;
   */
  mute: Optional<boolean>;
  /**
   * todo;
   */
  old_aim_time: Optional<TTimestamp>;
  /**
   * todo;
   */
  post_combat_wait: Optional<ISchemePostCombatIdleState>;
  /**
   * todo;
   */
  enemyId: Optional<TNumberId>;
  /**
   * todo;
   */
  enemy: Optional<GameObject>;
  /**
   * todo;
   */
  scriptCombatType: Optional<TName>;
  /**
   * Optional ID of linked camp game object, if registered object is in it.
   */
  camp: Optional<TNumberId>;
}

/**
 * Dynamic state stored with lua marshal lib.
 */
export interface IDynamicObjectState {
  hasBeenOnline: boolean;
}

/**
 * Offline object state descriptor.
 * Remember object active section when object switched offline.
 */
export interface IStoredOfflineObject {
  levelVertexId: Optional<TNumberId>;
  activeSection: Optional<TSection>;
}

/**
 * Descriptor of game object rank.
 */
export interface IRankDescriptor {
  min: TRate;
  max: TRate;
  name: TName;
}

/**
 * Descriptor of data saved to additional save file.
 */
export interface IDynamicSaveData {
  eventPacket: AnyObject;
  store: AnyObject;
  objects: LuaTable<TNumberId, IDynamicObjectState>;
}
