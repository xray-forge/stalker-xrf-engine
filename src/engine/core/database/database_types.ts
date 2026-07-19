import { GameObject, IniFile, Time } from "xray16/alias";
import { AnyObject, Nillable, TName, TNumberId, TRate, TSection, TTimestamp } from "xray16/lib";

import { StalkerPatrolController } from "@/engine/core/ai/patrol/StalkerPatrolController";
import { ObjectRestrictionsManager } from "@/engine/core/ai/restriction";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { TConditionList } from "@/engine/core/ini";
import { IActionSchemeHearState } from "@/engine/core/schemes/shared/hear";
import { IBaseSchemeState, ILogicsOverrides } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";

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
   * Binder-owned patrol controller for stalker objects.
   * Handles one object's patrol movement, waypoint callbacks, and team synchronization.
   */
  patrolController: Nillable<StalkerPatrolController>;
  /**
   * State controller class for stalker objects.
   * Handles current animation/animstate logics and adjust stalker object to match required logics.
   */
  stateController: Nillable<StalkerStateController>;
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
