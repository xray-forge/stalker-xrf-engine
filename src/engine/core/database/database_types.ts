import { GameObject, IniFile, Time } from "xray16/alias";
import {
  AnyObject,
  LuaArray,
  Nillable,
  TDuration,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringifiedNil,
  TTimestamp,
} from "xray16/lib";

import { StalkerPatrolManager } from "@/engine/core/ai/patrol/StalkerPatrolManager";
import { ObjectRestrictionsManager } from "@/engine/core/ai/restriction";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { IActionSchemeHearState } from "@/engine/core/schemes/shared/hear";
import { TConditionList } from "@/engine/core/utils/ini";
import { EScheme, ESchemeCondition, ESchemeType } from "@/engine/lib/types";

/**
 * Descriptor of a single parsed scheme logic entry with its condition list and parameters.
 */
export interface IBaseSchemeLogic {
  /**
   * Internal field, not for direct access.
   * Scheme condition type memoized on first switch evaluation, `name` field without numeric suffix.
   */
  $condition?: Nillable<ESchemeCondition | TStringifiedNil>;
  name: TName;
  condlist: TConditionList;
  objectId: Nillable<TNumberId>;
  p1: Nillable<string | number>;
  p2: Nillable<string | number>;
}

/**
 * List of scheme logics signal.
 * Used to set / check in some script scenarios.
 */
export type TSchemeSignals = LuaTable<TName, boolean>;

/**
 * Generic state of scheme logics stored in object state.
 * For each scheme separate table is allocated where information about its state and handlers is stored.
 */
export interface IBaseSchemeState {
  ini: IniFile;
  /**
   * List of switch conditions.
   * Based on logic check one scheme section can be switched to another if condlists provide next section.
   */
  logic: Nillable<LuaArray<IBaseSchemeLogic>>;
  /**
   * List of signals in active scheme state.
   * Signals are flags indicating whether some action/thing happened.
   */
  signals: Nillable<TSchemeSignals>;
  scheme: EScheme;
  section: Nillable<TSection>;
  actions?: LuaTable<AnyObject, boolean>;
  overrides: Nillable<ILogicsOverrides>;
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
  iniFilename: Nillable<TName>;
  /**
   * Based on object type, marks compatible scheme types.
   */
  schemeType: ESchemeType;
  /**
   * Currently active logic section of the object.
   */
  activeSection: Nillable<TSection>;
  /**
   * Currently active logic scheme of the object.
   */
  activeScheme: Nillable<EScheme>;
  /**
   * Describes INI file section with initial logic.
   * By default, it is `logic` or smart terrain job section name.
   */
  sectionLogic: Nillable<TName>;
  /**
   * Object smart terrain name.
   * Used as base for schemes to pick up logic when smart terrains are capturing objects/squads.
   * Having smart terrain allows selecting generic schemes defined for smart terrain.
   */
  smartTerrainName: Nillable<TName>;
  /**
   * Overrides applied on top of the active logic section.
   */
  overrides: Nillable<ILogicsOverrides>;
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
  jobIni: Nillable<TName>;
  /**
   * Describes last active logic file name when game was saved.
   */
  loadedIniFilename: Nillable<TName>;
  /**
   * Describes last active section logic section, source of initial object logic when game was saved.
   */
  loadedSectionLogic: Nillable<TSection>;
  /**
   * Describes last active logic section when game was saved.
   */
  loadedActiveSection: Nillable<TSection>;
  /**
   * Describes last active smart terrain name when game was saved.
   */
  loadedSmartTerrainName: Nillable<TName>;
}

/**
 * State logics overrides descriptor.
 */
export interface ILogicsOverrides {
  heliHunter: Nillable<TConditionList>;
  combatIgnore: Nillable<IBaseSchemeLogic>;
  combatIgnoreKeepWhenAttacked: Nillable<boolean>;
  combatType: Nillable<IBaseSchemeLogic>;
  scriptCombatType: Nillable<TName>;
  minPostCombatTime: TDuration;
  maxPostCombatTime: TDuration;
  onCombat: Nillable<IBaseSchemeLogic>;
  onOffline: Nillable<TConditionList>;
  soundgroup: Nillable<TName>;
}

/**
 * Client objects registry state describing logics and state.
 */
export interface IRegistryObjectState extends Record<EScheme, Nillable<IBaseSchemeState>>, IRegistryObjectStateLogic {
  /**
   * Client object reference to owner of the registry state.
   */
  object: GameObject;
  /**
   * Dynamically stored flags / variables.
   */
  portableStore: Nillable<LuaTable<TName>>;
  /**
   * Patrol manager for stalker objects.
   * Handles patrol selection/logics/waypoints etc.
   */
  patrolManager: Nillable<StalkerPatrolManager>;
  /**
   * State manager class for stalker objects.
   * Handles current animation/animstate logics and adjust stalker object to match required logics.
   */
  stateManager: Nillable<StalkerStateManager>;
  /**
   * Restrictions manager for game objects.
   * Handles current restrictions list depending on active logics.
   */
  restrictionsManager: Nillable<ObjectRestrictionsManager>;
  /**
   * State of the hear scheme handling object sound reactions.
   */
  hearInfo: Nillable<IActionSchemeHearState>;
  /**
   * Whether object is invulnerable to any damage.
   */
  invulnerable: Nillable<boolean>;
  /**
   * Whether the invulnerability condition-list cache has been initialized for the current object state.
   */
  hasInvulnerabilityCache?: boolean;
  /**
   * Active section used to build the cached invulnerability condition list.
   */
  invulnerabilitySection?: Nillable<TSection>;
  /**
   * Parsed immutable invulnerability configuration for `invulnerabilitySection`.
   */
  invulnerabilityConditionList?: Nillable<TConditionList>;
  /**
   * Whether game object is immortal.
   * Todo: Applicable for heli only. Should be somewhere else?
   */
  immortal: Nillable<boolean>;
  /**
   * Whether object sounds are muted.
   */
  mute: Nillable<boolean>;
  /**
   * Timestamp of the previous object aim time.
   */
  old_aim_time: Nillable<TTimestamp>;
  /**
   * Current enemy ID of the object.
   */
  enemyId: Nillable<TNumberId>;
  /**
   * Current enemy of the object.
   */
  enemy: Nillable<GameObject>;
  /**
   * Combat type forced by script logic for the object.
   */
  scriptCombatType: Nillable<TName>;
  /**
   * Nillable ID of linked camp game object, if registered object is in it.
   */
  camp: Nillable<TNumberId>;
}

/**
 * Type-only extension point that associates stateful schemes with their concrete registry state.
 *
 * Each state-owning scheme augments this interface beside its state declaration. Schemes without an
 * entry do not own a value in the per-object scheme-state registry.
 */
export interface ISchemeStateMap {}

/**
 * Scheme keys that have registered a concrete state type.
 */
export type TStatefulScheme = keyof ISchemeStateMap & EScheme;

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
export interface IRegistryOfflineState {
  levelVertexId: Nillable<TNumberId>;
  activeSection: Nillable<TSection>;
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
  event: AnyObject;
  store: AnyObject;
  extensions: AnyObject;
  objects: LuaMap<TNumberId, IDynamicObjectState>;
}
