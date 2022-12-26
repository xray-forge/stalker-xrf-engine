// todo: Separate file with DB objects
// todo: Separate file with DB utils

import { Optional } from "@/mod/lib/types";
import { ActorProxy, IActorProxy } from "@/mod/scripts/core/ActorProxy";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/db");

export const infoRestr = {};
export const scriptIds: Record<number, any> = {};
export const campStorage = {};
export const noWeapZones = {};
export const spawnedVertexById = {};
export const levelDoors = {};
export const signalLight = {};
export const goodwill = { sympathy: {}, relations: {} };
export const offlineObjects = {};

export const zoneByName: Record<string, XR_game_object> = {};

export const storage: Record<string, XR_object_binder> = {};
export const actorProxy: IActorProxy = create_xr_class_instance(ActorProxy);
export const heli: Record<number, XR_game_object> = {};
export const smartTerrainById: Record<number, XR_cse_alife_creature_abstract> = {};
export const animObjByName: Record<string, XR_object_binder> = {};
export const anomalyByName: Record<string, XR_object_binder> = {};

export const heliEnemies: Record<number, XR_game_object> = {};

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

  heliEnemies[heliEnemyCount] = object;

  heliEnemyCount = heliEnemyCount + 1;
  // @ts-ignore todo: TEMP
  db.heli_enemy_count = heliEnemyCount;
}

export function deleteEnemy(enemyIndex: number): void {
  log.info("Delete enemy");
  heliEnemies[enemyIndex] = null as any;
}

export function addObject(object: XR_game_object): void {
  log.info("Add object:", object.name());

  storage[object.id()].object = object;
}

export function deleteObject(object: XR_game_object): void {
  log.info("Delete object:", object.name());

  storage[object.id()] = null as any;
}

export function addZone(zone: XR_game_object): void {
  log.info("Add zone:", zone.name());

  zoneByName[zone.name()] = zone;
}

export function deleteZone(zone: XR_game_object): void {
  log.info("Delete zone:", zone.name());

  zoneByName[zone.name()] = null as any;
}

export function addAnomaly(anomaly: XR_object_binder): void {
  log.info("Add anomaly:", anomaly.object.name());

  anomalyByName[anomaly.object.name()] = anomaly;
}

export function deleteAnomaly(anomaly: XR_object_binder): void {
  log.info("Delete anomaly:", anomaly.object.name());

  anomalyByName[anomaly.object.name()] = null as any;
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

  heli[object.id()] = object;
}

export function deleteHeli(object: XR_game_object): void {
  log.info("Delete heli");

  heli[object.id()] = null as any;
}

export function addSmartTerrain(object: XR_cse_alife_creature_abstract): void {
  log.info("Add smart terrain:", object.id);

  smartTerrainById[object.id] = object;
}

export function deleteSmartTerrain(object: XR_cse_alife_creature_abstract): void {
  log.info("Delete smart terrain:", object.id);

  smartTerrainById[object.id] = null as any;
}

export function addAnimationObject(object: XR_game_object, binder: XR_object_binder): void {
  animObjByName[object.name()] = binder;
  addObject(object);
}

export function deleteAnimationObject(object: XR_game_object): void {
  animObjByName[object.name()] = null as any;
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
