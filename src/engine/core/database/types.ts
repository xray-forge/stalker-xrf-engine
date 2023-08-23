import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { IBaseSchemeState, ObjectRestrictionsManager } from "@/engine/core/schemes";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/combat_idle/ISchemePostCombatIdleState";
import { IActionSchemeHearState } from "@/engine/core/schemes/hear";
import {
  AnyObject,
  ClientObject,
  EScheme,
  ESchemeType,
  IniFile,
  Optional,
  Time,
  TName,
  TNumberId,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

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
  overrides: Optional<AnyObject>;
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
 * Client objects registry state describing logics and state.
 */
export interface IRegistryObjectState extends Record<EScheme, Optional<IBaseSchemeState>>, IRegistryObjectStateLogic {
  /**
   * Client object reference to owner of the registry state.
   */
  object: ClientObject;
  /**
   * Dynamically stored flags / variables.
   */
  portableStore: Optional<LuaTable<TName>>;
  /**
   * todo;
   */
  moveManager: Optional<StalkerMoveManager>;
  /**
   * todo;
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
   * ID of object currently looting object.
   * Used to prevent looting of same object by multiple objects at once.
   *
   * todo: Move to loot scheme state, not store it in global. Probaly pstore is correct place.
   */
  lootedByObject: Optional<TNumberId>;
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
  enemy_id: Optional<TNumberId>;
  /**
   * todo;
   */
  enemy: Optional<ClientObject>;
  /**
   * todo;
   */
  script_combat_type: Optional<TName>;
  /**
   * Optional ID of linked camp game object, if registered object is in it.
   */
  camp: Optional<TNumberId>;
}

/**
 * Offline object state descriptor.
 * Remember object active section when object switched offline.
 */
export interface IStoredOfflineObject {
  levelVertexId: Optional<TNumberId>;
  activeSection: Optional<TSection>;
}
