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
 * Client-side registry of game objects logics and states.
 */
export interface IRegistryObjectState extends Record<EScheme, Optional<IBaseSchemeState>> {
  /**
   * Client object reference to owner of the registry state.
   */
  object: ClientObject;
  /**
   * todo;
   */
  ini: IniFile;
  /**
   * todo;
   */
  ini_filename: Optional<TName>;
  /**
   * Dynamically stored flags / variables.
   */
  portableStore: Optional<LuaTable<TName>>;
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
   * todo;
   */
  section_logic: Optional<TName>;
  /**
   * todo;
   */
  gulag_name: Optional<TName>;
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
   * todo;
   */
  corpse_already_selected: Optional<TNumberId>;
  /**
   * todo;
   */
  wounded_already_selected: Optional<TNumberId>;
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
   * todo;
   */
  registred_camp: Optional<TNumberId>;
  /**
   * todo;
   */
  job_ini: Optional<TName>;
  /**
   * todo;
   */
  loaded_ini_filename: Optional<TName>;
  /**
   * todo;
   */
  loaded_section_logic: Optional<TSection>;
  /**
   * todo;
   */
  loaded_active_section: Optional<TSection>;
  /**
   * todo;
   */
  loaded_gulag_name: Optional<TName>;
}

/**
 * todo;
 */
export interface IStoredOfflineObject {
  levelVertexId: Optional<TNumberId>;
  activeSection: Optional<TSection>;
}
