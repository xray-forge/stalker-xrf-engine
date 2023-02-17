import {
  TXR_MonsterBodyStateKey,
  XR_cse_alife_object,
  XR_CUIGameCustom,
  XR_CZoneCampfire,
  XR_game_object,
  XR_ini_file,
  XR_object_binder,
  XR_vector,
} from "xray16";

import type { AnyCallable, AnyObject, EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import type { IAnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import type { ISignalLightBinder } from "@/mod/scripts/core/binders/SignalLightBinder";
import type { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import type { ActionLight } from "@/mod/scripts/core/logic/ActionLight";
import type { ActionSchemeAnimpoint } from "@/mod/scripts/core/logic/ActionSchemeAnimpoint";
import type { CampPatrolManager } from "@/mod/scripts/core/logic/ActionSchemeCamp";
import type { PatrolManager } from "@/mod/scripts/core/logic/ActionSchemePatrol";
import type { ITeleportPoint } from "@/mod/scripts/core/logic/ActionTeleport";
import type { ActionWoundManager } from "@/mod/scripts/core/logic/ActionWoundManager";
import type { CampStoryManager } from "@/mod/scripts/core/logic/CampStoryManager";
import type { ReachTaskPatrolManager } from "@/mod/scripts/core/logic/ReachTaskPatrolManager";
import type { RestrictorManager } from "@/mod/scripts/core/RestrictorManager";
import type { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";
import type { StateManager } from "@/mod/scripts/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("db", false);

// todo: Separate file with DB objects
// todo: Separate file with DB utils
export const schemes: LuaTable<string, typeof AbstractSchemeImplementation> = new LuaTable();

export const infoRestr: LuaTable<number, string | XR_game_object> = new LuaTable();
export const scriptIds: LuaTable<number> = new LuaTable();
export const campStorage: LuaTable = new LuaTable();
export const noWeapZones: LuaTable<string, boolean> = new LuaTable();
export const spawnedVertexById: LuaTable<number, number> = new LuaTable();
export const levelDoors: LuaTable<number, XR_vector> = new LuaTable();
export const signalLight: LuaTable<string, ISignalLightBinder> = new LuaTable();
export const goodwill = { sympathy: new LuaTable(), relations: new LuaTable() };
export const offlineObjects: LuaTable<number, any> = new LuaTable();
export const REGISTERED_ITEMS: LuaTable<string, number> = new LuaTable();
export const tradeState: LuaTable<number, ITradeManagerDescriptor> = new LuaTable();
export const silenceZones: LuaTable<number, string> = new LuaTable();

export const fighting_with_actor_npcs: LuaTable<number, boolean> = new LuaTable();
export const reactTaskPatrols: LuaTable<string, ReachTaskPatrolManager> = new LuaTable();
export const patrols: LuaTable<number, PatrolManager> = new LuaTable();
export const kamps: LuaTable<string, CampPatrolManager> = new LuaTable(); // Camp patrols.
export const kamp_stalkers: LuaTable<number, boolean> = new LuaTable();
export const CAMPS: LuaTable<number, CampStoryManager> = new LuaTable(); // Camp stories.
export const campfire_table: LuaTable<string, XR_CZoneCampfire> = new LuaTable();

// todo: Move to db.
export const ARTEFACT_WAYS_BY_ARTEFACT_ID: LuaTable<number, string> = new LuaTable();
// todo: Move to db.
export const ARTEFACT_POINTS_BY_ARTEFACT_ID: LuaTable<number, number> = new LuaTable();
/**
 * todo: Move to DB.
 * Ownership of artefacts linking.
 */
export const PARENT_ZONES_BY_ARTEFACT_ID: LuaTable<number, IAnomalyZoneBinder> = new LuaTable();

export const SAVE_MARKERS: LuaTable<string, number> = new LuaTable();

export const zoneByName: LuaTable<string, XR_game_object> = new LuaTable();

export interface ITradeManagerDescriptor {
  cfg_ltx: string;
  config: XR_ini_file;
  update_time: number;
  buy_condition: LuaTable<number>;
  sell_condition: LuaTable<number>;
  buy_supplies: LuaTable<number>;
  buy_item_condition_factor: LuaTable<number>;
  resuply_time: number;
  current_buy_condition: string;
  current_sell_condition: string;
  current_buy_item_condition_factor: number;
  current_buy_supplies: string;
}

export interface IStoredObject<T = XR_game_object> {
  [index: string]: any;

  enemy_id?: number;
  stype?: ESchemeType;
  section?: TSection;
  actions?: LuaTable<LuaTable<string, AnyCallable>, boolean>;
  pp?: XR_vector;
  avail_animations?: LuaTable<number, string>;
  animpoint?: ActionSchemeAnimpoint;
  scan_table?: LuaTable<number, LuaTable<number, { key: number; pos: XR_vector }>>;
  wounded?: { wound_manager: ActionWoundManager; not_for_help: boolean; enable_talk?: unknown };
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
  active_section?: Optional<TSection>;
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

export const storage: LuaTable<number, IStoredObject> = new LuaTable();
export const heli: LuaTable<number, XR_game_object> = new LuaTable();
export const smartTerrainById: LuaTable<number, XR_cse_alife_object> = new LuaTable();
export const animObjByName: LuaTable<string, IStoredObject> = new LuaTable();
export const anomalyByName: LuaTable<string, IStoredObject> = new LuaTable();
export const sound_themes: LuaTable<string, AbstractPlayableSound> = new LuaTable();
export const light_zones: LuaTable<number, ActionLight> = new LuaTable();

export const CROW_STORAGE = {
  STORAGE: new LuaTable<number, number>(),
  COUNT: 0,
};

export const heliEnemies: LuaTable<number, XR_game_object> = new LuaTable();

export let heliEnemyCount: number = 0;
export let actor: Optional<XR_game_object> = null;

// todo: Use wrapper and direct ref instead of getter?
export function getActor(): Optional<XR_game_object> {
  return actor;
}

export function getHeliEnemiesCount(): number {
  return heliEnemyCount;
}

export function addEnemy(object: XR_game_object): void {
  logger.info("Add heli enemy");

  heliEnemies.set(heliEnemyCount, object);

  heliEnemyCount = heliEnemyCount + 1;
  // @ts-ignore todo: TEMP
  db.heli_enemy_count = heliEnemyCount;
}

export function deleteEnemy(enemyIndex: number): void {
  logger.info("Delete enemy");
  heliEnemies.delete(enemyIndex);
}

export function addObject(object: XR_game_object): void {
  logger.info("Add object:", object.name());

  storage.get(object.id()).object = object;
}

export function deleteObject(object: XR_game_object): void {
  logger.info("Delete object:", object.name());

  storage.delete(object.id());
}

export function addZone(zone: XR_game_object): void {
  logger.info("Add zone:", zone.name());

  zoneByName.set(zone.name(), zone);
}

export function deleteZone(zone: XR_game_object): void {
  logger.info("Delete zone:", zone.name());

  zoneByName.delete(zone.name());
}

export function addAnomaly(anomaly: XR_object_binder): void {
  logger.info("Add anomaly:", anomaly.object.name());

  anomalyByName.set(anomaly.object.name(), anomaly);
}

export function deleteAnomaly(anomaly: XR_object_binder): void {
  logger.info("Delete anomaly:", anomaly.object.name());

  anomalyByName.delete(anomaly.object.name());
}

export function addActor(object: XR_game_object): void {
  logger.info("Add actor");

  actor = object;
  // @ts-ignore todo: TEMP
  db.actor = object;

  addObject(object);
}

export function deleteActor(): void {
  logger.info("Delete actor");

  deleteObject(actor as any);

  actor = null;
  // @ts-ignore todo: TEMP
  db.actor = null;
}

export function addHeli(object: XR_game_object): void {
  logger.info("Add heli");

  heli.set(object.id(), object);
}

export function deleteHeli(object: XR_game_object): void {
  logger.info("Delete heli");

  heli.delete(object.id());
}

export function addSmartTerrain(object: XR_cse_alife_object): void {
  logger.info("Add smart terrain:", object.id);

  smartTerrainById.set(object.id, object);
}

export function deleteSmartTerrain(object: XR_cse_alife_object): void {
  logger.info("Delete smart terrain:", object.id);

  smartTerrainById.delete(object.id);
}

export function addAnimationObject(object: XR_game_object, storedObject: IStoredObject): void {
  animObjByName.set(object.name(), storedObject);
  addObject(object);
}

export function deleteAnimationObject(object: XR_game_object): void {
  animObjByName.delete(object.name());
  deleteObject(object);
}

// todo: Temporary for old lua compat
declare_global("db", {
  zone_by_name: zoneByName,
  script_ids: scriptIds,
  storage: storage,
  actor: actor,
  heli: heli,
  camp_storage: campStorage,
  smart_terrain_by_id: smartTerrainById,
  info_restr: infoRestr,
  heli_enemies: heliEnemies,
  heli_enemy_count: heliEnemyCount,
  anim_obj_by_name: animObjByName,
  goodwill: goodwill,
  signal_light: signalLight,
  offline_objects: offlineObjects,
  anomaly_by_name: anomalyByName,
  level_doors: levelDoors,
  no_weap_zones: noWeapZones,
  spawned_vertex_by_id: spawnedVertexById,
  fighting_with_actor_npcs: fighting_with_actor_npcs,
  kamp_stalkers: kamp_stalkers,

  CROW_STORAGE: CROW_STORAGE,
  CAMPS: CAMPS,

  add_enemy: addEnemy,
  delete_enemy: deleteEnemy,
  add_obj: addObject,
  del_obj: deleteObject,
  add_zone: addZone,
  del_zone: deleteZone,
  add_anomaly: addAnomaly,
  del_anomaly: deleteAnomaly,
  add_actor: addActor,
  del_actor: deleteActor,
  add_heli: addHeli,
  del_heli: deleteHeli,
  add_smart_terrain: addSmartTerrain,
  del_smart_terrain: deleteSmartTerrain,
  add_anim_obj: addAnimationObject,
  del_anim_obj: deleteAnimationObject,
});
