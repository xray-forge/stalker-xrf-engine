import { XR_cse_alife_object, XR_game_object, XR_ini_file, XR_object_binder, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ActorProxy, IActorProxy } from "@/mod/scripts/core/ActorProxy";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("db", false);

// todo: Separate file with DB objects
// todo: Separate file with DB utils

export const infoRestr = {};
export const scriptIds: LuaTable<number, any> = new LuaTable();
export const campStorage = {};
export const noWeapZones = {};
export const spawnedVertexById: LuaTable<number, number> = new LuaTable();
export const levelDoors: LuaTable<number, XR_vector> = new LuaTable();
export const signalLight = {};
export const goodwill = { sympathy: new LuaTable(), relations: new LuaTable() };
export const offlineObjects: LuaTable<number, any> = new LuaTable();
export const REGISTERED_ITEMS: LuaTable<string, number> = new LuaTable();

export const zoneByName: LuaTable<string, XR_game_object> = new LuaTable();

export interface IStoredObject<T = XR_game_object> {
  [index: string]: any;

  ini?: XR_ini_file;
  object?: T;
  hit?: any;
  active_scheme?: string;
  active_section?: string;
  combat_ignore?: boolean;
  section_logic?: string;
  post_combat_wait?: unknown;
  pstor?: any;
  mob_death?: any;
  disable_input_time?: any;
  disable_input_idle?: any;
  state_mgr?: any;
  sr_deimos?: any;
  overrides?: {
    on_offline_condlist: number;
    min_post_combat_time: number;
    max_post_combat_time: number;
  };
}

export const storage: LuaTable<number, IStoredObject> = new LuaTable();
export const actorProxy: IActorProxy = create_xr_class_instance(ActorProxy);
export const heli: LuaTable<number, XR_game_object> = new LuaTable();
export const smartTerrainById: LuaTable<number, XR_cse_alife_object> = new LuaTable();
export const animObjByName: LuaTable<string, IStoredObject> = new LuaTable();
export const anomalyByName: LuaTable<string, IStoredObject> = new LuaTable();

export const CAMPS: LuaTable<number, { object?: XR_game_object; camp?: any }> = new LuaTable();

export const CROW_STORAGE = {
  STORAGE: new LuaTable<number, number>(),
  COUNT: 0
};

export const heliEnemies: LuaTable<number, XR_game_object> = new LuaTable();

export let heliEnemyCount: number = 0;
export let actor: Optional<XR_game_object> = null;

// todo: Use wrapper and direct ref instead of getter?
export function getActor(): Optional<XR_game_object> {
  return actor;
}

export function hetHeliEnemiesCount(): number {
  return heliEnemyCount;
}

export function addEnemy(object: XR_game_object): void {
  log.info("Add heli enemy");

  heliEnemies.set(heliEnemyCount, object);

  heliEnemyCount = heliEnemyCount + 1;
  // @ts-ignore todo: TEMP
  db.heli_enemy_count = heliEnemyCount;
}

export function deleteEnemy(enemyIndex: number): void {
  log.info("Delete enemy");
  heliEnemies.delete(enemyIndex);
}

export function addObject(object: XR_game_object): void {
  log.info("Add object:", object.name());

  storage.get(object.id()).object = object;
}

export function deleteObject(object: XR_game_object): void {
  log.info("Delete object:", object.name());

  storage.delete(object.id());
}

export function addZone(zone: XR_game_object): void {
  log.info("Add zone:", zone.name());

  zoneByName.set(zone.name(), zone);
}

export function deleteZone(zone: XR_game_object): void {
  log.info("Delete zone:", zone.name());

  zoneByName.delete(zone.name());
}

export function addAnomaly(anomaly: XR_object_binder): void {
  log.info("Add anomaly:", anomaly.object.name());

  anomalyByName.set(anomaly.object.name(), anomaly);
}

export function deleteAnomaly(anomaly: XR_object_binder): void {
  log.info("Delete anomaly:", anomaly.object.name());

  anomalyByName.delete(anomaly.object.name());
}

export function addActor(object: XR_game_object): void {
  log.info("Add actor");

  actor = object;
  // @ts-ignore todo: TEMP
  db.actor = object;

  actorProxy.net_spawn(object);
  addObject(object);
}

export function deleteActor(): void {
  log.info("Delete actor");

  deleteObject(actor as any);
  actorProxy.net_destroy();

  actor = null;
  // @ts-ignore todo: TEMP
  db.actor = null;
}

export function addHeli(object: XR_game_object): void {
  log.info("Add heli");

  heli.set(object.id(), object);
}

export function deleteHeli(object: XR_game_object): void {
  log.info("Delete heli");

  heli.delete(object.id());
}

export function addSmartTerrain(object: XR_cse_alife_object): void {
  log.info("Add smart terrain:", object.id);

  smartTerrainById.set(object.id, object);
}

export function deleteSmartTerrain(object: XR_cse_alife_object): void {
  log.info("Delete smart terrain:", object.id);

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
  actor_proxy: actorProxy,
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
  del_anim_obj: deleteAnimationObject
});
