import type { TXR_MonsterBodyStateKey, XR_CUIGameCustom, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import type { TRelation } from "@/mod/globals/relations";
import type {
  AnyCallable,
  AnyObject,
  EScheme,
  ESchemeType,
  Optional,
  TName,
  TNumberId,
  TSection,
} from "@/mod/lib/types";
import type { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import type { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import type { LabX8DoorBinder } from "@/mod/scripts/core/binders/LabX8DoorBinder";
import type { SignalLightBinder } from "@/mod/scripts/core/binders/SignalLightBinder";
import type {
  AbstractCoreManager,
  TAbstractCoreManagerConstructor,
} from "@/mod/scripts/core/managers/AbstractCoreManager";
import type { ITradeManagerDescriptor } from "@/mod/scripts/core/managers/TradeManager";
import type { SchemeAnimpoint } from "@/mod/scripts/core/schemes/animpoint/SchemeAnimpoint";
import type { TAbstractSchemeConstructor } from "@/mod/scripts/core/schemes/base";
import type { CampStoryManager } from "@/mod/scripts/core/schemes/camper/CampStoryManager";
import type { PatrolManager } from "@/mod/scripts/core/schemes/patrol/SchemePatrol";
import type { ReachTaskPatrolManager } from "@/mod/scripts/core/schemes/reach_task/ReachTaskPatrolManager";
import type { RestrictorManager } from "@/mod/scripts/core/schemes/RestrictorManager";
import type { SchemeLight } from "@/mod/scripts/core/schemes/sr_light/SchemeLight";
import type { ITeleportPoint } from "@/mod/scripts/core/schemes/teleport/SchemeTeleport";
import type { ISchemeWoundedState } from "@/mod/scripts/core/schemes/wounded";
import type { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import type { StalkerMoveManager } from "@/mod/scripts/core/state_management/StalkerMoveManager";
import type { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStoredObject<T = XR_game_object> {
  active_section?: Optional<TSection>;

  [index: string]: any;

  moveManager?: StalkerMoveManager;
  enemy_id?: TNumberId;
  stype?: ESchemeType;
  section?: Optional<TSection>;
  actions?: LuaTable<LuaTable<string, AnyCallable>, boolean>;
  pp?: XR_vector;
  avail_animations?: LuaTable<number, string>;
  animpoint?: SchemeAnimpoint;
  scan_table?: LuaTable<number, LuaTable<number, { key: number; pos: XR_vector }>>;
  wounded?: ISchemeWoundedState;
  approved_actions?: LuaTable<number, { predicate: AnyCallable; name: string }>;
  light?: boolean;
  points?: LuaTable<number, ITeleportPoint>;
  snd_close_start?: string;
  path_table?: LuaTable<number, string>;
  cam_effector?: LuaTable<number, string>;
  anim_head?: TXR_MonsterBodyStateKey;
  action?: any;
  ini?: XR_ini_file;
  object?: T;
  max_crows_on_level?: number;
  hit?: any;
  timeout?: number;
  smartcover?: any;
  active_scheme?: Optional<EScheme>;
  combat_ignore?: AnyObject;
  section_logic?: string;
  post_combat_wait?: unknown;
  pstor?: LuaTable<string>;
  death?: { killer: number; killer_name: Optional<string>; info: any; info2: any };
  mob_death?: any;
  disable_input_time?: any;
  disable_input_idle?: any;
  state_mgr?: Optional<StateManager>;
  ui?: XR_CUIGameCustom;
  restrictor_manager?: Optional<RestrictorManager>;
  overrides?: Optional<{
    combat_ignore_keep_when_attacked: number;
    on_offline_condlist: number;
    min_post_combat_time: number;
    max_post_combat_time: number;
    combat_ignore: AnyObject;
  }>;
}

/**
 * todo;
 */
export interface IStoredOfflineObject {
  level_vertex_id: Optional<TNumberId>;
  active_section: Optional<TSection>;
}

/**
 * Global-level registry of objects and references.
 * Stores up-to-date game state.
 */
export const registry = {
  /**
   * Current actor, injected on game start.
   */
  actor: null as unknown as XR_game_object,
  /**
   * List of active game managers.
   */
  managers: new LuaTable<TAbstractCoreManagerConstructor, AbstractCoreManager>(),
  /**
   * List of activated schemes in game.
   */
  schemes: new LuaTable<EScheme, TAbstractSchemeConstructor>(),
  /**
   * Set of objects in combat with actor.
   */
  actorCombat: new LuaTable<TNumberId, boolean>(),
  /**
   * List of active objects.
   */
  objects: new LuaTable<TNumberId, IStoredObject>(),
  /**
   * List of offline objects.
   */
  offlineObjects: new LuaTable<TNumberId, IStoredOfflineObject>(),
  /**
   * State of trade.
   */
  trade: new LuaTable<TNumberId, ITradeManagerDescriptor>(),
  /**
   * Camp related states.
   */
  camps: {
    stories: new LuaTable<TNumberId, CampStoryManager>(),
  },
  /**
   * List of current zone crows spawned.
   */
  crows: {
    // Used as set.
    storage: new LuaTable<TNumberId, TNumberId>(),
    count: 0,
  },
  /**
   * List of data for game helicopters.
   */
  helicopter: {
    storage: new LuaTable<TNumberId, XR_game_object>(),
    enemies: new LuaTable<TNumberId, XR_game_object>(),
    enemiesCount: 0,
  },
  /**
   * List active anomalies by name.
   */
  anomalies: new LuaTable<TName, AnomalyZoneBinder>(),
  /**
   * List of data for game artefacts.
   */
  artefacts: {
    ways: new LuaTable<TNumberId, TName>(),
    points: new LuaTable<TNumberId, number>(),
    parentZones: new LuaTable<TNumberId, AnomalyZoneBinder>(),
  },
  /**
   * Goodwill state.
   */
  goodwill: {
    sympathy: new LuaTable<TNumberId, number>(),
    relations: new LuaTable<TNumberId, TRelation>(),
  },
  /**
   * List of active zones by name.
   */
  zones: new LuaTable<TName, XR_game_object>(),
  /**
   * List of zones under silence restriction, no music is allowed.
   */
  silenceZones: new LuaTable<TNumberId, TName>(),
  /**
   * Set of zones under no weapon restriction.
   */
  noWeaponZones: new LuaTable<TName, boolean>(),
  /**
   * List of light active.
   */
  lightZones: new LuaTable<number, SchemeLight>(),
  /**
   * List of active smart terrains.
   */
  smartTerrains: new LuaTable<TNumberId, SmartTerrain>(),
  /**
   * List of objects spawned by scripts execution.
   * $ key - object id, value - zone name.
   */
  scriptSpawned: new LuaTable<TNumberId, TName>(),
  /**
   * List of active scripted animated doors.
   */
  animatedDoors: new LuaTable<TName, LabX8DoorBinder>(),
  /**
   * List of save markers.
   */
  saveMarkers: new LuaTable<TName, number>(),
  /**
   * List of signal lights existing.
   */
  signalLights: new LuaTable<TName, SignalLightBinder>(),
  /**
   * List of vertexes with matching IDs of existing objects.
   */
  spawnedVertexes: new LuaTable<TNumberId, TNumberId>(),
  /**
   * List of active patrols and actions.
   */
  patrols: {
    generic: new LuaTable<TNumberId, PatrolManager>(),
    reachTask: new LuaTable<TName, ReachTaskPatrolManager>(),
  },
  /**
   * State of active sounds.
   */
  sounds: {
    musicVolume: 0,
    effectsVolume: 0,
    generic: new LuaTable<TNumberId, AbstractPlayableSound>(),
    looped: new LuaTable<TNumberId, LuaTable<TName, AbstractPlayableSound>>(),
    themes: new LuaTable<TName, AbstractPlayableSound>(),
  },
};
