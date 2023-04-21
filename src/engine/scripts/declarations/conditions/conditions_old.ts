import {
  alife,
  clsid,
  game,
  game_object,
  level,
  XR_alife_simulator,
  XR_cse_abstract,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_MonsterHitInfo,
  XR_vector,
} from "xray16";

import {
  getObjectByStoryId,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  IRegistryObjectState,
  registry,
} from "@/engine/core/database";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements/AchievementsManager";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { ActorInventoryMenuManager, EActorMenuMode } from "@/engine/core/managers/interface/ActorInventoryMenuManager";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { SmartTerrainControl } from "@/engine/core/objects/server/smart/SmartTerrainControl";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart/types";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { SchemeAnimpoint } from "@/engine/core/schemes/animpoint";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { ISchemeDeathState } from "@/engine/core/schemes/death";
import { ISchemeHitState } from "@/engine/core/schemes/hit";
import { SchemeDeimos } from "@/engine/core/schemes/sr_deimos/SchemeDeimos";
import { abort } from "@/engine/core/utils/assertion";
import { getExtern } from "@/engine/core/utils/binding";
import {
  isActorAlive,
  isActorEnemy,
  isActorEnemyWithFaction,
  isActorFriendWithFaction,
  isActorNeutralWithFaction,
  isBlackScreen,
  isDistanceBetweenObjectsGreaterOrEqual,
  isDistanceBetweenObjectsLessOrEqual,
  isHeavilyWounded,
  isObjectInZone,
  isObjectWounded,
  isPlayingSound,
  isSquadExisting,
} from "@/engine/core/utils/check/check";
import { isMonster, isStalker, isWeapon } from "@/engine/core/utils/check/is";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  anomalyHasArtefact,
  getCharacterCommunity,
  getObjectSmartTerrain,
  getObjectSquad,
} from "@/engine/core/utils/object";
import {
  isFactionsEnemies,
  isFactionsFriends,
  isSquadRelationBetweenActorAndRelation,
} from "@/engine/core/utils/relation";
import { distanceBetween, npcInActorFrustum } from "@/engine/core/utils/vector";
import { captions, TCaption } from "@/engine/lib/constants/captions/captions";
import { TCommunity } from "@/engine/lib/constants/communities";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { relations } from "@/engine/lib/constants/relations";
import { FALSE } from "@/engine/lib/constants/words";
import { zones } from "@/engine/lib/constants/zones";
import {
  AnyArgs,
  AnyCallablesModule,
  EScheme,
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";
import { zat_b29_af_table, zat_b29_infop_bring_table } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function is_enemy_actor(object: XR_game_object): boolean {
  return isActorEnemy(object);
}

/**
 * todo;
 */
export function fighting_dist_ge(first: XR_game_object, second: XR_game_object, params: AnyArgs): boolean {
  return isDistanceBetweenObjectsGreaterOrEqual(first, second, params[0]);
}

/**
 * todo;
 */
export function fighting_dist_le(first: XR_game_object, second: XR_game_object, params: AnyArgs): boolean {
  return isDistanceBetweenObjectsLessOrEqual(first, second, params[0]);
}

/**
 * todo;
 */
export function enemy_in_zone(enemy: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const zone: Optional<XR_game_object> = registry.zones.get(params[0]);

  if (zone === null) {
    abort("Wrong zone name '%s' in enemy_in_zone function.", tostring(params[0]));
  }

  return isObjectInZone(enemy, zone);
}

/**
 * todo;
 */
export function black_screen(): boolean {
  return isBlackScreen();
}

/**
 * todo;
 */
export function check_npc_name(actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean {
  const npcName: Optional<TName> = npc.name();

  if (npcName === null) {
    return false;
  }

  for (const [k, v] of params) {
    if (string.find(npcName, v)[0] !== null) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function check_enemy_name(actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean {
  const enemyId: TNumberId = registry.objects.get(npc.id()).enemy_id!;
  const enemy: Optional<XR_game_object> = registry.objects.get(enemyId)?.object;

  if (enemy && enemy.alive()) {
    const name: string = enemy.name();

    for (const [i, v] of params) {
      if (string.find(name, v)[0] !== null) {
        return true;
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function is_playing_sound(actor: XR_game_object, npc: XR_game_object): boolean {
  return isPlayingSound(npc);
}

/**
 * todo;
 */
export function actor_alive(): boolean {
  return isActorAlive();
}

/**
 * todo;
 */
export function see_npc(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const targetNpc: Optional<XR_game_object> = getObjectByStoryId(params[0]);

  if (npc && targetNpc) {
    return npc.see(targetNpc);
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function actor_see_npc(actor: XR_game_object, npc: XR_game_object): boolean {
  return actor.see(npc);
}

/**
 * todo;
 */
export function npc_in_actor_frustum(actor: XR_game_object, npc: XR_game_object): boolean {
  return npcInActorFrustum(npc);
}

/**
 * todo;
 */
export function is_wounded(actor: XR_game_object, npc: XR_game_object): boolean {
  return isObjectWounded(npc);
}

/**
 * todo;
 */
export function dist_to_actor_le(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const distance: Optional<number> = params[0];

  if (distance === null) {
    abort("Wrong parameter in 'dist_to_actor_le' function: %s.", distance);
  }

  return npc.position().distance_to_sqr(actor.position()) <= distance * distance;
}

/**
 * todo;
 */
export function dist_to_actor_ge(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const distance: Optional<number> = params[0];

  if (distance === null) {
    abort("Wrong parameter in 'dist_to_actor_ge' function: %s.", distance);
  }

  return npc.position().distance_to_sqr(actor.position()) >= distance * distance;
}

/**
 * todo;
 */
export function distance_to_obj_on_job_le(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const smart: SmartTerrain = getObjectSmartTerrain(npc)!;

  for (const [k, v] of smart.objectJobDescriptors) {
    const npc_job = smart.jobsData.get(v.job_id);

    if (npc_job.section === params[0]) {
      return npc.position().distance_to_sqr(v.se_obj.position) <= params[1] * params[1];
    }
  }

  return false;
}

/**
 * todo;
 */
export function is_obj_on_job(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const smart =
    params && params[1]
      ? SimulationBoardManager.getInstance().getSmartTerrainByName(params[1])
      : getObjectSmartTerrain(npc);

  if (smart === null) {
    return false;
  }

  for (const [k, v] of smart.objectJobDescriptors) {
    const npc_job = smart.jobsData.get(v.job_id);

    if (npc_job.section === params[0]) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function obj_in_zone(actor: XR_game_object, zone: XR_game_object, params: LuaTable): boolean {
  const sim: XR_alife_simulator = alife();

  for (const [i, v] of params) {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(v);

    if (objectId && zone.inside(sim.object(objectId)!.position)) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function one_obj_in_zone(actor: XR_game_object, zone: XR_game_object, params: [string, string]): boolean {
  const obj1: Optional<number> = getObjectIdByStoryId(params[0]);

  if (obj1) {
    return zone.inside(alife().object(obj1)!.position);
  } else {
    return params[1] !== FALSE;
  }
}

/**
 * todo;
 */
export function health_le(actor: XR_game_object, npc: XR_game_object, params: [number]): boolean {
  return params[0] !== null && npc.health < params[0];
}

/**
 * todo;
 */
export function actor_health_le(actor: XR_game_object, npc: XR_game_object, params: [number]): boolean {
  return params[0] !== null && actor.health < params[0];
}

/**
 * todo;
 */
export function heli_health_le(actor: XR_game_object, object: XR_game_object, params: [number]): boolean {
  return params[0] !== null && object.get_helicopter().GetfHealth() < params[0];
}

/**
 * todo;
 */
export function story_obj_in_zone_by_name(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [TStringId, string]
): boolean {
  const objectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);
  const zone: Optional<XR_game_object> = registry.zones.get(params[1]);

  if (objectId && zone) {
    return zone.inside(alife().object(objectId)!.position);
  }

  return false;
}

/**
 * todo;
 */
export function actor_in_zone(actor: XR_game_object, npc: XR_game_object, params: [string]): boolean {
  return isObjectInZone(registry.actor, registry.zones.get(params[0]));
}

/**
 * todo;
 */
export function npc_in_zone(actor: XR_game_object, npc: XR_game_object | XR_cse_abstract, params: [string]): boolean {
  const zone: Optional<XR_game_object> = registry.zones.get(params[0]);
  let objectId: Optional<XR_game_object> = null;

  if (type(npc.id) !== "function") {
    objectId = registry.objects.get((npc as XR_cse_abstract).id)?.object as Optional<XR_game_object>;

    if (zone === null) {
      return true;
    } else if (objectId === null) {
      return zone.inside((npc as XR_cse_abstract).position);
    }
  } else {
    objectId = npc as XR_game_object;
  }

  return isObjectInZone(objectId, zone);
}

/**
 * todo;
 */
export function jup_b16_is_zone_active(actor: XR_game_object, npc: XR_game_object): boolean {
  return hasAlifeInfo(npc.name() as TInfoPortion);
}

/**
 * todo;
 */
export function heli_see_npc(actor: XR_game_object, object: XR_game_object, params: [string]) {
  if (params[0]) {
    const storyObject: Optional<XR_game_object> = getObjectByStoryId(params[0]);

    return storyObject !== null && object.get_helicopter().isVisible(storyObject);
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function heli_see_actor(actor: XR_game_object, object: XR_game_object): boolean {
  return actor !== null && object.get_helicopter().isVisible(actor);
}

/**
 * todo;
 */
export function enemy_group(actor: XR_game_object, npc: XR_game_object, params: LuaTable<number>): boolean {
  const enemyId: number = registry.objects.get(npc.id()).enemy_id as number;
  const enemy: XR_game_object = registry.objects.get(enemyId)?.object as XR_game_object;
  const enemyGroup = enemy?.group();

  for (const [i, v] of params) {
    if (v === enemyGroup) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function npc_community(
  actor: XR_game_object,
  npc: XR_game_object | XR_cse_alife_human_abstract,
  params: [TCommunity]
): boolean {
  if (params[0] === null) {
    abort("Wrong number of params in npc_community");
  }

  let npc_obj: Optional<XR_game_object> = null;

  if (type(npc.id) !== "function") {
    npc_obj = registry.objects.get((npc as XR_cse_alife_human_abstract).id)?.object as XR_game_object;

    if (npc_obj === null) {
      return (npc as XR_cse_alife_human_abstract).community() === params[0];
    }
  } else {
    npc_obj = npc as XR_game_object;
  }

  return getCharacterCommunity(npc_obj) === params[0];
}

/**
 * todo;
 */
export function hitted_by(actor: XR_game_object, npc: XR_game_object, parameters: LuaTable<TStringId>): boolean {
  const state: Optional<ISchemeHitState> = registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState;

  if (state !== null) {
    for (const [index, storyId] of parameters) {
      const listNpc: Optional<XR_game_object> = getObjectByStoryId(storyId);

      if (listNpc !== null && state.who === listNpc.id()) {
        return true;
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function hitted_on_bone(actor: XR_game_object, npc: XR_game_object, parameters: LuaArray<TStringId>): boolean {
  const boneIndex: TIndex = (registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState).bone_index;

  for (const [index, id] of parameters) {
    if (npc.get_bone_id(id) === boneIndex) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function best_pistol(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.item_in_slot(1) !== null;
}

/**
 * todo;
 */
export function deadly_hit(actor: XR_game_object, npc: XR_game_object): boolean {
  return (registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState)?.deadly_hit === true;
}

/**
 * todo;
 */
export function killed_by(actor: XR_game_object, npc: XR_game_object, parameters: LuaArray<string>) {
  const schemeState: Optional<ISchemeDeathState> = registry.objects.get(npc.id())[EScheme.DEATH] as ISchemeDeathState;

  if (schemeState !== null) {
    for (const [i, v] of parameters) {
      const object = getObjectByStoryId(v);

      if (object && schemeState.killer === object.id()) {
        return true;
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function is_alive_all(actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean {
  for (const [i, v] of params) {
    const npcId = getObjectIdByStoryId(v);

    if (npcId === null) {
      return false;
    }

    const npcCseObject: Optional<XR_cse_alife_creature_abstract> = alife().object(npcId);

    if (npcCseObject && (!isStalker(npcCseObject) || !npcCseObject.alive())) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function is_alive_one(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): boolean {
  for (const [i, v] of p) {
    const npcId = getObjectIdByStoryId(v);

    if (npcId === null) {
      return false;
    }

    const npc1 = alife().object(npcId);

    if (npc1 && isStalker(npc1) && npc1.alive()) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function is_alive(actor: XR_game_object, npc: XR_game_object | XR_cse_abstract, params: [string]): boolean {
  let npc1: Optional<TNumberId> = null;

  if (npc === null || (params && params[0])) {
    npc1 = getObjectIdByStoryId(params[0]);
  } else if (type(npc.id) === "number") {
    npc1 = (npc as XR_cse_abstract).id;
  } else {
    npc1 = (npc as XR_game_object).id();
  }

  if (npc1 === null) {
    return false;
  }

  const serverObject: Optional<XR_cse_alife_object> = alife().object(npc1);

  return serverObject !== null && isStalker(serverObject) && serverObject.alive();
}

/**
 * todo;
 */
export function is_dead_all(actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean {
  for (const [index, value] of params) {
    const npc1: Optional<XR_game_object> = getObjectByStoryId(value);

    if (npc1) {
      return !npc1.alive();
    }

    return false;
  }

  return true;
}

/**
 * todo;
 */
export function is_dead_one(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): boolean {
  for (const [index, value] of p) {
    const npc1: Optional<XR_game_object> = getObjectByStoryId(value);

    if (!npc1 || !npc1.alive()) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function is_dead(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  const npc1: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  return !npc1 || !npc1.alive();
}

/**
 * todo;
 */
export function story_object_exist(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  return getObjectByStoryId(p[0]) !== null;
}

/**
 * todo;
 */
export function actor_has_item(actor: XR_game_object, npc: XR_game_object, params: [Optional<string>]): boolean {
  const story_actor = registry.actor;

  return params[0] !== null && story_actor !== null && story_actor.object(params[0]) !== null;
}

/**
 * todo;
 */
export function npc_has_item(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  return p[0] !== null && npc.object(p[0]) !== null;
}

/**
 * todo;
 */
export function actor_has_item_count(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  const item_section: TSection = p[0];
  const need_count: number = tonumber(p[1])!;
  let has_count: number = 0;

  actor.iterate_inventory((temp, item) => {
    if (item.section() === item_section) {
      has_count = has_count + 1;
    }
  }, actor);

  return has_count >= need_count;
}

/**
 * todo;
 */
export function signal(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  if (p[0]) {
    const st = registry.objects.get(npc.id());
    const sigs = st[st.active_scheme!]!.signals;

    return sigs !== null && sigs.get(p[0]);
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function counter_greater(
  actor: XR_game_object,
  npc: XR_game_object,
  p: [Optional<string>, Optional<number>]
): boolean {
  if (p[0] && p[1]) {
    return getPortableStoreValue(actor, p[0], 0) > p[1];
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function counter_equal(
  actor: XR_game_object,
  npc: XR_game_object,
  p: [Optional<string>, Optional<number>]
): boolean {
  if (p[0] && p[1]) {
    return getPortableStoreValue(actor, p[0], 0) === p[1];
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function _used(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.is_talking();
}

/**
 * todo;
 */
export function has_enemy(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.best_enemy() !== null;
}

/**
 * todo;
 */
export function has_actor_enemy(actor: XR_game_object, npc: XR_game_object): boolean {
  const best_enemy: Optional<XR_game_object> = npc.best_enemy();

  return best_enemy !== null && best_enemy.id() === registry.actor.id();
}

/**
 * todo;
 */
export function see_enemy(actor: XR_game_object, npc: XR_game_object): boolean {
  const enemy = npc.best_enemy();

  if (enemy !== null) {
    return npc.see(enemy);
  }

  return false;
}

/**
 * todo;
 */
const alarm_statuses = {
  normal: ESmartTerrainStatus.NORMAL,
  danger: ESmartTerrainStatus.DANGER,
  alarm: ESmartTerrainStatus.ALARM,
};

/**
 * todo;
 */
export function check_smart_alarm_status(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [string, string]
): boolean {
  const smartName: string = params[0];
  const status: ESmartTerrainStatus = alarm_statuses[params[1] as keyof typeof alarm_statuses];

  if (status === null) {
    abort("Wrong status[%s] in 'check_smart_alarm_status'", tostring(params[1]));
  }

  const smart: SmartTerrain = SimulationBoardManager.getInstance().getSmartTerrainByName(smartName)!;
  const smartControl: SmartTerrainControl = smart.smartTerrainActorControl;

  if (smartControl === null) {
    abort("Cannot calculate 'check_smart_alarm_status' for smart %s", tostring(smartName));
  }

  return smartControl.getSmartTerrainStatus() === status;
}

/**
 * todo;
 */
export function is_factions_enemies(actor: XR_game_object, npc: XR_game_object, p: [TCommunity]): boolean {
  if (p[0] !== null) {
    return isFactionsEnemies(getCharacterCommunity(actor), p[0]);
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function is_factions_neutrals(actor: XR_game_object, npc: XR_game_object, p: [TCommunity]) {
  return !(is_factions_enemies(actor, npc, p) || is_factions_friends(actor, npc, p));
}

/**
 * todo;
 */
export function is_factions_friends(actor: XR_game_object, npc: XR_game_object, p: [TCommunity]) {
  if (p[0] !== null) {
    return isFactionsFriends(getCharacterCommunity(actor), p[0]);
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function is_faction_enemy_to_actor(actor: XR_game_object, npc: XR_game_object, p: [TCommunity]): boolean {
  return p[0] === null ? false : isActorEnemyWithFaction(p[0]);
}

/**
 * todo;
 */
export function is_faction_friend_to_actor(actor: XR_game_object, npc: XR_game_object, p: [TCommunity]): boolean {
  return p[0] === null ? false : isActorFriendWithFaction(p[0]);
}

/**
 * todo;
 */
export function is_faction_neutral_to_actor(actor: XR_game_object, npc: XR_game_object, p: [TCommunity]): boolean {
  return p[0] === null ? false : isActorNeutralWithFaction(p[0]);
}

/**
 * todo;
 */
export function is_squad_friend_to_actor(actor: XR_game_object, npc: XR_game_object, params: [string]): boolean {
  if (params[0] !== null) {
    return isSquadRelationBetweenActorAndRelation(params[0], relations.friend);
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function is_squad_enemy_to_actor(actor: XR_game_object, npc: XR_game_object, params: Array<string>): boolean {
  if (!params) {
    abort("Not enough arguments in 'is_squad_enemy_to_actor' function!");
  }

  for (const [k, v] of params as unknown as LuaArray<string>) {
    if (isSquadRelationBetweenActorAndRelation(v, relations.enemy)) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function is_squad_neutral_to_actor(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  return !(is_squad_enemy_to_actor(actor, npc, p) || is_squad_friend_to_actor(actor, npc, p));
}

/**
 * todo;
 */
export function fighting_actor(actor: XR_game_object, npc: XR_game_object): boolean {
  const enemy_id: number = registry.objects.get(npc.id()).enemy_id!;
  const enemy: Optional<XR_game_object> = registry.objects.get(enemy_id)?.object as Optional<XR_game_object>;

  return enemy !== null && enemy.id() === actor.id();
}

/**
 * todo;
 */
export function hit_by_actor(actor: XR_game_object, npc: XR_game_object): boolean {
  const state: Optional<ISchemeHitState> = registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState;

  return state !== null && state.who === actor.id();
}

/**
 * todo;
 */
export function killed_by_actor(actor: XR_game_object, npc: XR_game_object): boolean {
  return (registry.objects.get(npc.id())[EScheme.DEATH] as ISchemeDeathState)?.killer === actor.id();
}

/**
 * todo;
 */
export function actor_has_weapon(actor: XR_game_object): boolean {
  const obj = actor.active_item();

  if (obj === null || isWeapon(obj) === false) {
    return false;
  }

  return true;
}

/**
 * todo;
 */
export function actor_active_detector(actor: XR_game_object, npc: XR_game_object, p: Optional<[TSection]>): boolean {
  const detector_section = p && p[0];

  if (detector_section === null) {
    abort("Wrong parameters in function 'actor_active_detector'");
  }

  const activeDetector = registry.actor.active_detector();

  return activeDetector !== null && activeDetector.section() === detector_section;
}

/**
 * todo;
 */
export function heavy_wounded(actor: XR_game_object, npc: XR_game_object): boolean {
  return isHeavilyWounded(npc.id());
}

/**
 * todo;
 */
export function time_period(actor: XR_game_object, npc: XR_game_object, p: [number, number]): boolean {
  const [tshift, period] = p;

  if (tshift !== null && period !== null && registry.actor !== null) {
    return tshift > period && level.get_time_minutes() % tshift <= period;
  }

  return false;
}

/**
 * todo;
 */
export function mob_has_enemy(actor: XR_game_object, npc: XR_game_object): boolean {
  if (npc === null) {
    return false;
  }

  return npc.get_enemy() !== null;
}

/**
 * todo;
 */
export function mob_was_hit(actor: XR_game_object, npc: XR_game_object): boolean {
  const h: XR_MonsterHitInfo = npc.get_monster_hit_info();

  return h.who && h.time !== 0;
}

/**
 * todo;
 */
export function actor_on_level(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): boolean {
  for (const [k, v] of p) {
    if (v === level.name()) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function treasure_exist(actor: XR_game_object, npc: XR_game_object) {
  return true;
}

/**
 * todo;
 */
export function squad_in_zone(actor: XR_game_object, npc: XR_game_object, p: [string, string]) {
  const storyId: TStringId = p[0];
  let zoneName: TName = p[1];

  if (storyId === null) {
    abort(
      "Insufficient params in squad_in_zone function. story_id[%s], zone_name[%s]",
      tostring(storyId),
      tostring(zoneName)
    );
  }

  if (zoneName === null) {
    zoneName = npc.name();
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return false;
  }

  const zone = registry.zones.get(zoneName);

  if (zone === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    const position: XR_vector = registry.objects.get(squadMember.id)?.object?.position() || squadMember.object.position;

    if (zone.inside(position)) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function squad_has_enemy(actor: XR_game_object, npc: XR_game_object, p: [Optional<TStringId>]): boolean {
  const storyId: Optional<TStringId> = p[0];

  if (storyId === null) {
    abort("Insufficient params in squad_has_enemy function. story_id [%s]", tostring(storyId));
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    const npc_obj = level.object_by_id(squadMember.object.id);

    if (npc_obj === null) {
      return false;
    }

    if (npc_obj.best_enemy() !== null) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function squad_in_zone_all(actor: XR_game_object, npc: XR_game_object, p: [TStringId, TName]): boolean {
  const storyId: TStringId = p[0];
  const zoneName: TName = p[1];

  if (storyId === null || zoneName === null) {
    abort(
      "Insufficient params in squad_in_zone_all function. story_id[%s], zone_name[%s]",
      tostring(storyId),
      tostring(zoneName)
    );
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return false;
  }

  const zone: Optional<XR_game_object> = registry.zones.get(zoneName);

  if (zone === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    const position: XR_vector = registry.objects.get(squadMember.id)?.object?.position() || squadMember.object.position;

    if (!zone.inside(position)) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function squads_in_zone_b41(actor: XR_game_object, npc: XR_game_object): boolean {
  const smartTerrain: Optional<SmartTerrain> = SimulationBoardManager.getInstance().getSmartTerrainByName("jup_b41");
  const zone: Optional<XR_game_object> = registry.zones.get("jup_b41_sr_light");

  if (zone === null) {
    return false;
  }

  if (smartTerrain === null) {
    return false;
  }

  for (const [k, v] of SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(smartTerrain.id)!
    .assignedSquads) {
    if (v !== null) {
      for (const j of v.squad_members()) {
        if (!zone.inside(j.object.position)) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * todo;
 */
export function target_squad_name(actor: XR_game_object, object: XR_cse_alife_creature_abstract, p: [string]) {
  if (p[0] === null) {
    abort("Wrong parameters for 'target_squad_name'.");
  }

  if (!object) {
    return false;
  }

  if (isStalker(object) || isMonster(object)) {
    if (alife().object(object.group_id) === null) {
      return false;
    }

    if (string.find(alife().object(object.group_id)!.section_name(), p[0])[0] !== null) {
      return true;
    }
  }

  return object.section_name() === p[0];
}

/**
 * todo;
 */
export function target_smart_name(actor: XR_game_object, smart: XR_game_object, p: [string]): boolean {
  if (p[0] === null) {
    abort("Wrong parameters");
  }

  return smart.name() === p[0];
}

/**
 * todo;
 */
export function squad_exist(actor: XR_game_object, npc: XR_game_object, p: [Optional<string>]): boolean {
  const storyId: Optional<string> = p[0];

  if (storyId === null) {
    abort("Wrong parameter story_id[%s] in squad_exist function", tostring(storyId));
  } else {
    return isSquadExisting(storyId);
  }
}

/**
 * todo;
 */
export function is_squad_commander(
  actor: XR_game_object,
  npc: XR_game_object | XR_cse_alife_creature_abstract
): boolean {
  const npc_id: number = type(npc.id) === "number" ? (npc as XR_cse_alife_object).id : (npc as XR_game_object).id();
  const squad: Optional<Squad> = getObjectSquad(npc);

  return squad !== null && squad.commander_id() === npc_id;
}

/**
 * todo;
 */
export function squad_npc_count_ge(actor: XR_game_object, npc: XR_game_object, p: [string, string]): boolean {
  const story_id: Optional<string> = p[0];

  if (story_id === null) {
    abort("Wrong parameter squad_id[%s] in 'squad_npc_count_ge' function", tostring(story_id));
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(story_id) as Optional<Squad>;

  if (squad) {
    return squad.npc_count() > tonumber(p[1])!;
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function surge_complete(): boolean {
  return SurgeManager.getInstance().isFinished;
}

/**
 * todo;
 */
export function surge_started(): boolean {
  return SurgeManager.getInstance().isStarted;
}

/**
 * todo;
 */
export function surge_kill_all(): boolean {
  return SurgeManager.getInstance().isKillingAll();
}

/**
 * todo;
 */
export function signal_rocket_flying(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  if (p === null) {
    abort("Signal rocket name is !set!");
  }

  if (registry.signalLights.get(p[0]) !== null) {
    return registry.signalLights.get(p[0]).isFlying();
  } else {
    abort("No such signal rocket: [%s] on level", tostring(p[0]));
  }

  return false;
}

/**
 * todo;
 */
export function quest_npc_enemy_actor(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  if (p[0] === null) {
    abort("wrong story id");
  } else {
    const object: Optional<XR_game_object> = getObjectByStoryId(p[0]);

    if (object && isStalker(object)) {
      const actor: Optional<XR_game_object> = registry.actor;

      if (actor && object.general_goodwill(actor) <= -1000) {
        return true;
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function animpoint_reached(actor: XR_game_object, npc: XR_game_object): boolean {
  const animpointState: Optional<ISchemeAnimpointState> = registry.objects.get(npc.id())[
    SchemeAnimpoint.SCHEME_SECTION
  ] as Optional<ISchemeAnimpointState>;

  if (animpointState === null) {
    return false;
  }

  return animpointState.animpoint.position_riched();
}

/**
 * todo;
 */
export function in_dest_smart_cover(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.in_smart_cover();
}

/**
 * todo;
 */
export function distance_to_obj_ge(actor: XR_game_object, npc: XR_game_object, p: [string, number]): boolean {
  const objectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
  const object: Optional<XR_cse_alife_object> = objectId ? alife().object(objectId) : null;

  if (object) {
    return registry.actor.position().distance_to_sqr(object.position) >= p[1] * p[1];
  }

  return false;
}

/**
 * todo;
 */
export function distance_to_obj_le(actor: XR_game_object, npc: XR_game_object, p: [string, number]): boolean {
  const objectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
  const object: Optional<XR_cse_alife_object> = objectId ? alife().object(objectId) : null;

  if (object) {
    return registry.actor.position().distance_to_sqr(object.position) < p[1] * p[1];
  }

  return false;
}

/**
 * todo;
 */
export function active_item(actor: XR_game_object, npc: XR_game_object, params: LuaArray<TSection>): boolean {
  if (params && params.has(1)) {
    for (const [k, section] of params) {
      if (actor.item_in_slot(3) !== null && actor.item_in_slot(3)!.section() === section) {
        return true;
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function check_bloodsucker_state(
  actor: XR_game_object,
  npc: Optional<XR_game_object>,
  p: [string, string]
): boolean {
  if ((p && p[0]) === null) {
    abort("Wrong parameters in function 'check_bloodsucker_state'!!!");
  }

  let state: string = p[0];

  if (p[1] !== null) {
    state = p[1];
    npc = getObjectByStoryId(p[1]);
  }

  if (npc !== null) {
    return npc.get_visibility_state() === tonumber(state)!;
  }

  return false;
}

/**
 * todo;
 */
export function actor_nomove_nowpn(): boolean {
  return !isWeapon(registry.actor.active_item()) || registry.actor.is_talking();
}

/**
 * todo;
 */
export function dist_to_story_obj_ge(actor: XR_game_object, npc: XR_game_object, p: [string, number]): boolean {
  const storyId: TStringId = p && p[0];
  const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

  if (storyObjectId === null) {
    return true;
  }

  return alife().object(storyObjectId)!.position.distance_to(registry.actor.position()) > p[1];
}

/**
 * todo;
 */
export function actor_has_nimble_weapon(actor: XR_game_object, npc: XR_game_object): boolean {
  const need_item: LuaTable<string, boolean> = {
    wpn_groza_nimble: true,
    wpn_desert_eagle_nimble: true,
    wpn_fn2000_nimble: true,
    wpn_g36_nimble: true,
    wpn_protecta_nimble: true,
    wpn_mp5_nimble: true,
    wpn_sig220_nimble: true,
    wpn_spas12_nimble: true,
    wpn_usp_nimble: true,
    wpn_vintorez_nimble: true,
    wpn_svu_nimble: true,
    wpn_svd_nimble: true,
  } as unknown as LuaTable<string, boolean>;

  for (const [k, v] of need_item) {
    if (actor.object(k) !== null) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_has_active_nimble_weapon(actor: XR_game_object, npc: XR_game_object): boolean {
  const need_item: Record<string, boolean> = {
    wpn_groza_nimble: true,
    wpn_desert_eagle_nimble: true,
    wpn_fn2000_nimble: true,
    wpn_g36_nimble: true,
    wpn_protecta_nimble: true,
    wpn_mp5_nimble: true,
    wpn_sig220_nimble: true,
    wpn_spas12_nimble: true,
    wpn_usp_nimble: true,
    wpn_vintorez_nimble: true,
    wpn_svu_nimble: true,
    wpn_svd_nimble: true,
  };

  if (actor.item_in_slot(2) !== null && need_item[actor.item_in_slot(2)!.section()] === true) {
    return true;
  } else if (actor.item_in_slot(3) !== null && need_item[actor.item_in_slot(3)!.section()] === true) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
export function jup_b202_inventory_box_empty(actor: XR_game_object, npc: XR_game_object): boolean {
  return getObjectByStoryId("jup_b202_actor_treasure")!.is_inv_box_empty();
}

/**
 * todo;
 */
export function has_enemy_in_current_loopholes_fov(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.in_smart_cover() && npc.best_enemy() !== null && npc.in_current_loophole_fov(npc.best_enemy()!.position());
}

/**
 * todo;
 */
export function talking(actor: XR_game_object): boolean {
  return actor.is_talking();
}

/**
 * todo;
 */
export function npc_talking(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.is_talking();
}

/**
 * todo;
 */
export function see_actor(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.alive() && npc.see(actor);
}

/**
 * todo;
 */
export function actor_enemy(actor: XR_game_object, npc: XR_game_object): boolean {
  const state: Optional<ISchemeDeathState> = registry.objects.get(npc.id())[EScheme.DEATH] as ISchemeDeathState;

  return npc.relation(actor) === game_object.enemy || state?.killer === actor.id();
}

/**
 * todo;
 */
export function actor_friend(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.relation(actor) === game_object.friend;
}

/**
 * todo;
 */
export function actor_neutral(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.relation(actor) === game_object.neutral;
}

/**
 * todo;
 */
export function is_rain(): boolean {
  return registry.actor !== null && level.rain_factor() > 0;
}

/**
 * todo;
 */
export function is_heavy_rain(): boolean {
  return registry.actor !== null && level.rain_factor() >= 0.5;
}

/**
 * todo;
 */
export function is_day(): boolean {
  return registry.actor !== null && level.get_time_hours() >= 6 && level.get_time_hours() < 21;
}

/**
 * todo;
 */
export function is_dark_night(): boolean {
  return registry.actor !== null && (level.get_time_hours() < 3 || level.get_time_hours() > 22);
}

/**
 * todo;
 */
export function is_jup_a12_mercs_time(): boolean {
  return registry.actor !== null && level.get_time_hours() >= 1 && level.get_time_hours() < 5;
}

/**
 * todo;
 */
export function zat_b7_is_night(): boolean {
  return registry.actor !== null && (level.get_time_hours() >= 23 || level.get_time_hours() < 5);
}

/**
 * todo;
 */
export function zat_b7_is_late_attack_time(): boolean {
  return registry.actor !== null && (level.get_time_hours() >= 23 || level.get_time_hours() < 9);
}

/**
 * todo;
 */
export function object_exist(actor: XR_game_object, npc: XR_game_object, params: [string]): boolean {
  return getObjectByStoryId(params[0]) !== null;
}

/**
 * todo;
 */
export function squad_curr_action(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  return getObjectSquad(npc)!.currentAction?.name === p[0];
}

/**
 * todo;
 */
export function is_monster_snork(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.snork_s;
}

/**
 * todo;
 */
export function is_monster_dog(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.dog_s;
}

/**
 * todo;
 */
export function is_monster_psy_dog(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.psy_dog_s;
}

/**
 * todo;
 */
export function is_monster_polter(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.poltergeist_s;
}

/**
 * todo;
 */
export function is_monster_tushkano(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.tushkano_s;
}

/**
 * todo;
 */
export function is_monster_burer(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.burer_s;
}

/**
 * todo;
 */
export function is_monster_controller(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.controller_s;
}

/**
 * todo;
 */
export function is_monster_flesh(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.flesh_s;
}

/**
 * todo;
 */
export function is_monster_boar(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.clsid() === clsid.boar_s;
}

/**
 * todo;
 */
export function dead_body_searching(actor: XR_game_object, npc: XR_game_object): boolean {
  return ActorInventoryMenuManager.getInstance().isActiveMode(EActorMenuMode.DEAD_BODY_SEARCH);
}

/**
 * todo;
 */
export function jup_b47_npc_online(actor: XR_game_object, npc: XR_game_object, params: [string]) {
  const storyObject: Optional<XR_game_object> = getObjectByStoryId(params[0]);

  if (storyObject === null) {
    return false;
  }

  return alife().object(storyObject.id()) !== null;
}

/**
 * todo;
 */
export function anomaly_has_artefact(
  actor: XR_game_object,
  npc: XR_game_object,
  p: [string, string]
): LuaMultiReturn<[boolean, Optional<LuaArray<string>>]> {
  const [artefact, details] = anomalyHasArtefact(actor, npc, p);

  return $multi(artefact, details);
}

/**
 * todo;
 */
export function zat_b29_anomaly_has_af(actor: XR_game_object, npc: XR_game_object, p: Optional<string>) {
  const az_name = p && p[0];
  let af_name: Optional<string> = null;

  const anomal_zone = registry.anomalies.get(az_name as TName);

  if (az_name === null || anomal_zone === null || anomal_zone.spawnedArtefactsCount < 1) {
    return false;
  }

  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(i))) {
      af_name = zat_b29_af_table.get(i);
      break;
    }
  }

  for (const [artefactId] of registry.artefacts.ways) {
    if (alife().object(tonumber(artefactId)!) && af_name === alife().object(tonumber(artefactId)!)!.section_name()) {
      registry.actor.give_info_portion(az_name);

      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function jup_b221_who_will_start(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  const reachable_theme: LuaArray<number> = new LuaTable();
  const infoPortionsList: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.jup_b25_freedom_flint_gone,
    infoPortions.jup_b25_flint_blame_done_to_duty,
    infoPortions.jup_b4_monolith_squad_in_duty,
    infoPortions.jup_a6_duty_leader_bunker_guards_work,
    infoPortions.jup_a6_duty_leader_employ_work,
    infoPortions.jup_b207_duty_wins,
    infoPortions.jup_b207_freedom_know_about_depot,
    infoPortions.jup_b46_duty_founder_pda_to_freedom,
    infoPortions.jup_b4_monolith_squad_in_freedom,
    infoPortions.jup_a6_freedom_leader_bunker_guards_work,
    infoPortions.jup_a6_freedom_leader_employ_work,
    infoPortions.jup_b207_freedom_wins,
  ]);

  for (const [k, v] of infoPortionsList) {
    const factionsList: LuaArray<string> = new LuaTable();

    if (k <= 6) {
      factionsList.set(1, "duty");
      factionsList.set(2, "0");
    } else {
      factionsList.set(1, "freedom");
      factionsList.set(2, "6");
    }

    if (
      hasAlifeInfo(v) &&
      !hasAlifeInfo(
        ("jup_b221_" +
          factionsList.get(1) +
          "_main_" +
          tostring(k - tonumber(factionsList.get(2))!) +
          "_played") as TInfoPortion
      )
    ) {
      table.insert(reachable_theme, k);
    }
  }

  if ((p && p[0]) === null) {
    abort("No such parameters in function 'jup_b221_who_will_start'");
  }

  if (tostring(p[0]) === "ability") {
    return reachable_theme.length() !== 0;
  } else if (tostring(p[0]) === "choose") {
    return reachable_theme.get(math.random(1, reachable_theme.length())) <= 6;
  } else {
    abort("Wrong parameters in function 'jup_b221_who_will_start'");
  }
}

/**
 * todo;
 */
export function pas_b400_actor_far_forward(actor: XR_game_object, npc: XR_game_object): boolean {
  const forwardObject = getObjectByStoryId("pas_b400_fwd");

  if (forwardObject) {
    if (distanceBetween(forwardObject, registry.actor) > distanceBetween(forwardObject, npc)) {
      return false;
    }
  } else {
    return false;
  }

  const distance = 70 * 70;
  const self_dist = npc.position().distance_to_sqr(actor.position());

  if (self_dist < distance) {
    return false;
  }

  const squad: Squad = alife().object(alife().object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!;

  for (const squadMember in squad.squad_members()) {
    // todo: Mistake or typedef upd needed.
    const other_dist = (squadMember as any).object.position.distance_to_sqr(actor.position());

    if (other_dist < distance) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function pas_b400_actor_far_backward(actor: XR_game_object, npc: XR_game_object): boolean {
  const backwardObject: Optional<XR_game_object> = getObjectByStoryId("pas_b400_bwd");

  if (backwardObject !== null) {
    if (distanceBetween(backwardObject, registry.actor) > distanceBetween(backwardObject, npc)) {
      return false;
    }
  } else {
    return false;
  }

  const distance = 70 * 70;
  const self_dist = npc.position().distance_to_sqr(actor.position());

  if (self_dist < distance) {
    return false;
  }

  const sim: XR_alife_simulator = alife();
  const squad: Squad = sim.object<Squad>(sim.object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!;

  for (const squadMember of squad.squad_members()) {
    const other_dist = squadMember.object.position.distance_to_sqr(actor.position());

    if (other_dist < distance) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function pri_a28_actor_is_far(actor: XR_game_object, npc: XR_game_object): boolean {
  const distance: TDistance = 150 * 150;
  const squad: Optional<Squad> = getServerObjectByStoryId("pri_a16_military_squad")!;

  if (squad === null) {
    abort("Unexpected actor far check - no squad existing.");
  }

  for (const squadMember of squad.squad_members()) {
    const objectDistanceToActor: TDistance = squadMember.object.position.distance_to_sqr(actor.position());

    if (objectDistanceToActor < distance) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function check_enemy_smart(actor: XR_game_object, npc: XR_game_object, params: [string]) {
  const enemyId: Optional<TNumberId> = registry.objects.get(npc.id()).enemy_id;
  const enemy: Optional<XR_game_object> = enemyId ? registry.objects.get(enemyId)?.object : null;

  if (enemy === null || enemyId === alife().actor().id) {
    return false;
  }

  const enemy_smart: Optional<SmartTerrain> = getObjectSmartTerrain(enemy);

  return enemy_smart !== null && enemy_smart.name() === params[0];
}

/**
 * todo;
 */
export function zat_b103_actor_has_needed_food(actor: XR_game_object, npc: XR_game_object): boolean {
  return (
    getExtern<AnyCallablesModule>("dialogs_zaton").zat_b103_actor_has_needed_food(actor, npc) ||
    hasAlifeInfo(infoPortions.zat_b103_merc_task_done)
  );
}

/**
 * todo;
 */
export function zat_b29_rivals_dialog_precond(actor: XR_game_object, npc: XR_game_object): boolean {
  const squadsList: LuaArray<TName> = $fromArray<TName>([
    "zat_b29_stalker_rival_default_1_squad",
    "zat_b29_stalker_rival_default_2_squad",
    "zat_b29_stalker_rival_1_squad",
    "zat_b29_stalker_rival_2_squad",
  ]);
  const zonesList: LuaArray<TName> = $fromArray([
    zones.zat_b29_sr_1,
    "zat_b29_sr_2",
    "zat_b29_sr_3",
    "zat_b29_sr_4",
    "zat_b29_sr_5",
  ]);

  let f_squad: boolean = false;

  for (const [k, v] of squadsList) {
    if (alife().object(alife().object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!.section_name() === v) {
      f_squad = true;
      break;
    }
  }

  if (!f_squad) {
    return false;
  }

  for (const [k, v] of zonesList) {
    if (isObjectInZone(npc, registry.zones.get(v))) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function jup_b202_actor_treasure_not_in_steal(actor: XR_game_object, npc: XR_game_object) {
  const before: boolean =
    !hasAlifeInfo(infoPortions.jup_b52_actor_items_can_be_stolen) &&
    !hasAlifeInfo(infoPortions.jup_b202_actor_items_returned);
  const after: boolean =
    hasAlifeInfo(infoPortions.jup_b52_actor_items_can_be_stolen) &&
    hasAlifeInfo(infoPortions.jup_b202_actor_items_returned);

  return before || after;
}

/**
 * todo;
 */
export function polter_ignore_actor(actor: XR_game_object, npc: XR_game_object) {
  return npc.poltergeist_get_actor_ignore();
}

/**
 * todo;
 */
export function burer_gravi_attack(actor: XR_game_object, npc: XR_game_object) {
  return npc.burer_get_force_gravi_attack();
}

/**
 * todo;
 */
export function burer_anti_aim(actor: XR_game_object, npc: XR_game_object) {
  return npc.burer_get_force_anti_aim();
}

/**
 * todo;
 */
export function jup_b25_senya_spawn_condition(): boolean {
  return (
    (hasAlifeInfo(infoPortions.jup_b16_oasis_found) ||
      hasAlifeInfo(infoPortions.zat_b57_bloodsucker_lair_clear) ||
      hasAlifeInfo(infoPortions.jup_b6_complete_end) ||
      hasAlifeInfo(infoPortions.zat_b215_gave_maps)) &&
    hasAlifeInfo(infoPortions.zat_b106_search_soroka)
  );
}

/**
 * todo;
 */
export function jup_b25_flint_gone_condition(): boolean {
  return (
    hasAlifeInfo(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasAlifeInfo(infoPortions.jup_b25_flint_blame_done_to_freedom) ||
    hasAlifeInfo(infoPortions.zat_b106_found_soroka_done)
  );
}

/**
 * todo;
 */
export function check_deimos_phase(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  if (params[0] && params[1]) {
    const obj: IRegistryObjectState = registry.objects.get(npc.id());
    const delta: boolean = SchemeDeimos.checkIntensityDelta(obj);

    if (params[1] === "increasing" && delta) {
      return false;
    } else if (params[1] === "decreasing" && !delta) {
      return false;
    }

    if (params[0] === "disable_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkDisableBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkDisableBound(obj);
      }
    } else if (params[0] === "lower_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkLowerBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkLowerBound(obj);
      }
    } else if (params[0] === "upper_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkUpperBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkUpperBound(obj);
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function upgrade_hint_kardan(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const itemUpgradeHints: LuaArray<TCaption> = new LuaTable();
  const toolsCount: TCount = (params && tonumber(params[0])) || 0;
  let can_upgrade = 0;

  if (!hasAlifeInfo(infoPortions.zat_b3_all_instruments_brought)) {
    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_1_brought) && (toolsCount === 0 || toolsCount === 1)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_1);
    } else if (toolsCount === 1) {
      can_upgrade = can_upgrade + 1;
    }

    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_2_brought) && (toolsCount === 0 || toolsCount === 2)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_2);
    } else if (toolsCount === 2) {
      can_upgrade = can_upgrade + 1;
    }

    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_3_brought) && (toolsCount === 0 || toolsCount === 3)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_3);
    } else if (toolsCount === 3) {
      can_upgrade = can_upgrade + 1;
    }
  } else {
    can_upgrade = can_upgrade + 1;
  }

  if (!hasAlifeInfo(infoPortions.zat_b3_tech_see_produce_62)) {
    if (toolsCount === 1 && !hasAlifeInfo(infoPortions.zat_b3_tech_have_one_dose)) {
      table.insert(itemUpgradeHints, captions.st_upgr_vodka);
    } else if (toolsCount !== 1 && !hasAlifeInfo(infoPortions.zat_b3_tech_have_couple_dose)) {
      table.insert(itemUpgradeHints, captions.st_upgr_vodka);
    } else {
      can_upgrade = can_upgrade + 1;
    }
  } else {
    can_upgrade = can_upgrade + 1;
  }

  ItemUpgradesManager.getInstance().setCurrentHints(itemUpgradeHints);

  return can_upgrade >= 2;
}

/**
 * todo;
 */
export function actor_in_surge_cover(actor: XR_game_object, npc: XR_game_object): boolean {
  return SurgeManager.getInstance().isActorInCover();
}

/**
 * todo;
 */
export function is_door_blocked_by_npc(actor: XR_game_object, object: XR_game_object): boolean {
  return object.is_door_blocked_by_npc();
}

/**
 * todo;
 */
export function has_active_tutorial(): boolean {
  return game.has_active_tutorial();
}

/**
 * todo;
 */
export function wealthy_functor(): boolean {
  return AchievementsManager.getInstance().checkAchievedWealthy();
}

/**
 * todo;
 */
export function information_dealer_functor(): boolean {
  return AchievementsManager.getInstance().checkAchievedInformationDealer();
}
