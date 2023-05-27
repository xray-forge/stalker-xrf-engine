import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { IBaseSchemeState, ObjectRestrictionsManager } from "@/engine/core/schemes";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/danger/ISchemePostCombatIdleState";
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
  object: ClientObject;
  ini: IniFile;
  ini_filename: Optional<TName>;

  /**
   * Dynamically stored flags / variables.
   */
  portableStore: Optional<LuaTable<TName>>;

  schemeType: ESchemeType;
  active_section: Optional<TSection>;
  active_scheme: Optional<EScheme>;
  section_logic: Optional<TName>;
  gulag_name: Optional<TName>;
  overrides: Optional<AnyObject>;

  activation_time: TTimestamp;
  activation_game_time: Time;

  moveManager: Optional<StalkerMoveManager>;
  stateManager: Optional<StalkerStateManager>;
  restrictionsManager: Optional<ObjectRestrictionsManager>;
  hearInfo: Optional<IActionSchemeHearState>;

  invulnerable: Optional<boolean>;
  immortal: Optional<boolean>;
  mute: Optional<boolean>;
  corpse_already_selected: Optional<TNumberId>;
  wounded_already_selected: Optional<TNumberId>;
  old_aim_time: Optional<TTimestamp>;
  post_combat_wait: Optional<ISchemePostCombatIdleState>;

  enemy_id: Optional<TNumberId>;
  enemy: Optional<ClientObject>;
  script_combat_type: Optional<TName>;
  registred_camp: Optional<TNumberId>;

  job_ini: Optional<TName>;
  loaded_ini_filename: Optional<TName>;
  loaded_section_logic: Optional<TSection>;
  loaded_active_section: Optional<TSection>;
  loaded_gulag_name: Optional<TName>;
}

/**
 * todo;
 */
export interface IStoredOfflineObject {
  levelVertexId: Optional<TNumberId>;
  activeSection: Optional<TSection>;
}
