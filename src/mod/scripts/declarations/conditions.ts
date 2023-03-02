import {
  alife,
  clsid,
  game,
  game_object,
  level,
  relation_registry,
  XR_alife_simulator,
  XR_cse_abstract,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_cse_alife_online_offline_group,
  XR_game_object,
  XR_MonsterHitInfo,
  XR_vector,
} from "xray16";

import { captions } from "@/mod/globals/captions";
import { TCommunity } from "@/mod/globals/communities";
import { info_portions } from "@/mod/globals/info_portions/info_portions";
import { relations } from "@/mod/globals/relations";
import { zones } from "@/mod/globals/zones";
import { AnyArgs, AnyCallablesModule, LuaArray, Maybe, Optional, TName, TSection } from "@/mod/lib/types";
import { SimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { ESmartTerrainStatus, SmartTerrainControl } from "@/mod/scripts/core/alife/SmartTerrainControl";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { pstor_retrieve } from "@/mod/scripts/core/database/pstor";
import { get_sim_board } from "@/mod/scripts/core/database/SimBoard";
import * as game_relations from "@/mod/scripts/core/GameRelationsManager";
import { setCurrentHint } from "@/mod/scripts/core/inventory_upgrades";
import { AchievementsManager } from "@/mod/scripts/core/managers/AchievementsManager";
import { ActorInventoryMenuManager, EActorMenuMode } from "@/mod/scripts/core/managers/ActorInventoryMenuManager";
import { SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { SchemeDeimos } from "@/mod/scripts/core/schemes/sr_deimos/SchemeDeimos";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import {
  anomalyHasArtefact,
  getCharacterCommunity,
  getObjectSquad,
  getStoryObject,
  getStorySquad,
} from "@/mod/scripts/utils/alife";
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
  isNpcInZone,
  isObjectWounded,
  isPlayingSound,
  isSquadExisting,
} from "@/mod/scripts/utils/checkers/checkers";
import { isMonster, isStalker, isWeapon } from "@/mod/scripts/utils/checkers/is";
import { abort } from "@/mod/scripts/utils/debug";
import { getObjectBoundSmart } from "@/mod/scripts/utils/gulag";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { distanceBetween, npcInActorFrustum } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("xr_conditions");

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

  return isNpcInZone(enemy, zone);
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
  const npcName: Optional<string> = npc.name();

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
  const enemy_id: number = registry.objects.get(npc.id()).enemy_id!;
  const enemy: Maybe<XR_game_object> = registry.objects.get(enemy_id)?.object;

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
  const targetNpc: Maybe<XR_game_object> = getStoryObject(params[0]);

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
  const smart: SmartTerrain = getObjectBoundSmart(npc)!;

  for (const [k, v] of smart.npc_info) {
    const npc_job = smart.job_data.get(v.job_id);

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
  const smart = params && params[1] ? get_sim_board().get_smart_by_name(params[1]) : getObjectBoundSmart(npc);

  if (smart === null) {
    return false;
  }

  for (const [k, v] of smart.npc_info) {
    const npc_job = smart.job_data.get(v.job_id);

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
    const npcId: Optional<number> = getStoryObjectId(v);

    if (npcId && zone.inside(sim.object(npcId)!.position)) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function one_obj_in_zone(actor: XR_game_object, zone: XR_game_object, params: [string, string]): boolean {
  const obj1: Optional<number> = getStoryObjectId(params[0]);

  if (obj1) {
    return zone.inside(alife().object(obj1)!.position);
  } else {
    return params[1] !== "false";
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
  params: [string, string]
): boolean {
  const object = getStoryObjectId(params[0]);
  const zone = registry.zones.get(params[1]);

  if (object && zone) {
    return zone.inside(alife().object(object)!.position);
  }

  return false;
}

/**
 * todo;
 */
export function actor_in_zone(actor: XR_game_object, npc: XR_game_object, params: [string]): boolean {
  return isNpcInZone(registry.actor, registry.zones.get(params[0]));
}

/**
 * todo;
 */
export function npc_in_zone(actor: XR_game_object, npc: XR_game_object | XR_cse_abstract, params: [string]): boolean {
  const zone = registry.zones.get(params[0]);
  let npc_obj: Optional<XR_game_object> = null;

  if (type(npc.id) !== "function") {
    npc_obj = registry.objects.get((npc as XR_cse_abstract).id)?.object as Optional<XR_game_object>;

    if (zone === null) {
      return true;
    } else if (npc_obj === null) {
      return zone.inside((npc as XR_cse_abstract).position);
    }
  } else {
    npc_obj = npc as XR_game_object;
  }

  return isNpcInZone(npc_obj, zone);
}

/**
 * todo;
 */
export function jup_b16_is_zone_active(actor: XR_game_object, npc: XR_game_object): boolean {
  return hasAlifeInfo(npc.name());
}

/**
 * todo;
 */
export function heli_see_npc(actor: XR_game_object, object: XR_game_object, params: [string]) {
  if (params[0]) {
    const storyObject: Optional<XR_game_object> = getStoryObject(params[0]);

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
export function hitted_by(actor: XR_game_object, npc: XR_game_object, params: LuaTable<string>): boolean {
  const hit = registry.objects.get(npc.id()).hit;

  if (hit !== null) {
    for (const [i, v] of params) {
      const listNpc: Optional<XR_game_object> = getStoryObject(v);

      if (listNpc !== null && hit.who === listNpc.id()) {
        return true;
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function hitted_on_bone(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): boolean {
  for (const [k, v] of p) {
    if (registry.objects.get(npc.id()).hit.bone_index === npc.get_bone_id(v)) {
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
  return registry.objects.get(npc.id())?.hit?.deadly_hit === true;
}

/**
 * todo;
 */
export function killed_by(actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>) {
  const target = registry.objects.get(npc.id()).death;

  if (target) {
    for (const [i, v] of p) {
      const npc1 = getStoryObject(v);

      if (npc1 && target.killer === npc1.id()) {
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
    const npcId = getStoryObjectId(v);

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
    const npcId = getStoryObjectId(v);

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
  let npc1: Optional<number>;

  if (npc === null || (params && params[0])) {
    npc1 = getStoryObjectId(params[0]);
  } else if (type(npc.id) === "number") {
    npc1 = (npc as XR_cse_abstract).id;
  } else {
    npc1 = (npc as XR_game_object).id();
  }

  if (npc1 === null) {
    return false;
  }

  const object = alife().object(npc1);

  return object !== null && isStalker(object) && object.alive();
}

/**
 * todo;
 */
export function is_dead_all(actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean {
  for (const [i, v] of params) {
    const npc1: Optional<XR_game_object> = getStoryObject(v);

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
  for (const [i, v] of p) {
    const npc1: Optional<XR_game_object> = getStoryObject(v);

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
  const npc1: Optional<XR_game_object> = getStoryObject(p[0]);

  return !npc1 || !npc1.alive();
}

/**
 * todo;
 */
export function story_object_exist(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  return getStoryObject(p[0]) !== null;
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
    const sigs = st[st.active_scheme!].signals;

    return sigs !== null && sigs[p[0]] === true;
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
    return pstor_retrieve(actor, p[0], 0) > p[1];
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
    return pstor_retrieve(actor, p[0], 0) === p[1];
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

  const smart: SmartTerrain = get_sim_board().get_smart_by_name(smartName)!;
  const smartControl: SmartTerrainControl = smart.base_on_actor_control;

  if (smartControl === null) {
    abort("Cannot calculate 'check_smart_alarm_status' for smart %s", tostring(smartName));
  }

  return smartControl.get_status() === status;
}

/**
 * todo;
 */
export function is_factions_enemies(actor: XR_game_object, npc: XR_game_object, p: [TCommunity]): boolean {
  if (p[0] !== null) {
    return game_relations.is_factions_enemies(getCharacterCommunity(actor), p[0]);
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
    return game_relations.is_factions_friends(getCharacterCommunity(actor), p[0]);
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
    return game_relations.check_all_squad_members(params[0], relations.friend);
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
    if (game_relations.check_all_squad_members(v, relations.enemy)) {
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
  const t = registry.objects.get(npc.id()).hit;

  return t !== null && t.who === actor.id();
}

/**
 * todo;
 */
export function killed_by_actor(actor: XR_game_object, npc: XR_game_object): boolean {
  return registry.objects.get(npc.id()).death?.killer === actor.id();
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
  const storyId: string = p[0];
  let zoneName: string = p[1];

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

  const squad = getStorySquad(storyId);

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
export function squad_has_enemy(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  const storyId: string = p[0];

  if (storyId === null) {
    abort("Insufficient params in squad_has_enemy function. story_id [%s]", tostring(storyId));
  }

  const squad = getStorySquad(storyId);

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
export function squad_in_zone_all(actor: XR_game_object, npc: XR_game_object, p: [string, string]): boolean {
  const story_id = p[0];
  const zone_name = p[1];

  if (story_id === null || zone_name === null) {
    abort(
      "Insufficient params in squad_in_zone_all function. story_id[%s], zone_name[%s]",
      tostring(story_id),
      tostring(zone_name)
    );
  }

  const squad = getStorySquad(story_id);

  if (squad === null) {
    return false;
  }

  const zone = registry.zones.get(zone_name);

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
  const smart = get_sim_board().get_smart_by_name("jup_b41");
  const zone = registry.zones.get("jup_b41_sr_light");

  if (zone === null) {
    return false;
  }

  if (smart === null) {
    return false;
  }

  for (const [k, v] of get_sim_board().smarts.get(smart.id).squads) {
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
export function target_squad_name(actor: XR_game_object, obj: XR_cse_alife_creature_abstract, p: [string]) {
  if (p[0] === null) {
    abort("Wrong parameters for 'target_squad_name'.");
  }

  if (!obj) {
    return false;
  }

  if (isStalker(obj) || isMonster(obj)) {
    if (alife().object(obj.group_id) === null) {
      return false;
    }

    if (string.find(alife().object(obj.group_id)!.section_name(), p[0])[0] !== null) {
      return true;
    }
  }

  return obj.section_name() === p[0];
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
  const squad: Optional<SimSquad> = getObjectSquad(npc);

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

  const squad: Optional<SimSquad> = getStorySquad(story_id) as Optional<SimSquad>;

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
    return registry.signalLights.get(p[0]).is_flying();
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
    const obj = getStoryObject(p[0]);

    if (obj && isStalker(obj)) {
      const actor: Optional<XR_game_object> = registry.actor;

      if (actor && obj.general_goodwill(actor) <= -1000) {
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
  const animpoint_storage: Optional<IStoredObject> = registry.objects.get(npc.id())
    .animpoint as Optional<IStoredObject>;

  if (animpoint_storage === null) {
    return false;
  }

  return animpoint_storage.animpoint!.position_riched();
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
  const npc_id: Optional<number> = getStoryObjectId(p[0]);
  const npc1: Optional<XR_cse_alife_object> = npc_id ? alife().object(npc_id) : null;

  if (npc1) {
    return registry.actor.position().distance_to_sqr(npc1.position) >= p[1] * p[1];
  }

  return false;
}

/**
 * todo;
 */
export function distance_to_obj_le(actor: XR_game_object, npc: XR_game_object, p: [string, number]): boolean {
  const npc_id: Optional<number> = getStoryObjectId(p[0]);
  const npc1: Optional<XR_cse_alife_object> = npc_id ? alife().object(npc_id) : null;

  if (npc1) {
    return registry.actor.position().distance_to_sqr(npc1.position) < p[1] * p[1];
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
    npc = getStoryObject(p[1]);
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
  const story_id: string = p && p[0];
  const story_obj_id: Optional<number> = getStoryObjectId(story_id);

  if (story_obj_id === null) {
    return true;
  }

  return alife().object(story_obj_id)!.position.distance_to(registry.actor.position()) > p[1];
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
  return getStoryObject("jup_b202_actor_treasure")!.is_inv_box_empty();
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
  const t = registry.objects.get(npc.id()).death;

  return npc.relation(actor) === game_object.enemy || t?.killer === actor.id();
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
export function is_in_danger(
  actor: XR_game_object,
  npc: XR_game_object,
  params: Optional<[Optional<string>]>
): boolean {
  return registry.objects.get(params && params[0] ? getStoryObject(params[0])!.id() : npc.id()).danger_flag;
}

/**
 * todo;
 */
export function object_exist(actor: XR_game_object, npc: XR_game_object, params: [string]): boolean {
  return getStoryObject(params[0]) !== null;
}

/**
 * todo;
 */
export function squad_curr_action(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  return getObjectSquad(npc)!.current_action?.name === p[0];
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
  const story_obj = getStoryObject(params[0]);

  if (story_obj === null) {
    return false;
  }

  return alife().object(story_obj.id()) !== null;
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
    if (hasAlifeInfo(get_global("dialogs_zaton").zat_b29_infop_bring_table[i])) {
      af_name = get_global("dialogs_zaton").zat_b29_af_table[i];
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
  const info_table: LuaArray<string> = [
    info_portions.jup_b25_freedom_flint_gone,
    info_portions.jup_b25_flint_blame_done_to_duty,
    info_portions.jup_b4_monolith_squad_in_duty,
    info_portions.jup_a6_duty_leader_bunker_guards_work,
    info_portions.jup_a6_duty_leader_employ_work,
    info_portions.jup_b207_duty_wins,
    info_portions.jup_b207_freedom_know_about_depot,
    info_portions.jup_b46_duty_founder_pda_to_freedom,
    info_portions.jup_b4_monolith_squad_in_freedom,
    info_portions.jup_a6_freedom_leader_bunker_guards_work,
    info_portions.jup_a6_freedom_leader_employ_work,
    info_portions.jup_b207_freedom_wins,
  ] as unknown as LuaArray<string>;

  for (const [k, v] of info_table) {
    const faction_table: LuaArray<string> = new LuaTable();

    if (k <= 6) {
      faction_table.set(1, "duty");
      faction_table.set(2, "0");
    } else {
      faction_table.set(1, "freedom");
      faction_table.set(2, "6");
    }

    if (
      hasAlifeInfo(v) &&
      !hasAlifeInfo(
        "jup_b221_" + faction_table.get(1) + "_main_" + tostring(k - tonumber(faction_table.get(2))!) + "_played"
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
  const fwd_obj = getStoryObject("pas_b400_fwd");

  if (fwd_obj) {
    if (distanceBetween(fwd_obj, registry.actor) > distanceBetween(fwd_obj, npc)) {
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

  const squad: SimSquad = alife().object(alife().object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!;

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
  const bwd_obj: Optional<XR_game_object> = getStoryObject("pas_b400_bwd");

  if (bwd_obj !== null) {
    if (distanceBetween(bwd_obj, registry.actor) > distanceBetween(bwd_obj, npc)) {
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
  const squad: SimSquad = sim.object<SimSquad>(sim.object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!;

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
  const distance: number = 150 * 150;
  const squad: XR_cse_alife_online_offline_group = getStorySquad("pri_a16_military_squad")!;

  for (const k of squad.squad_members()) {
    const npc_dist = k.object.position.distance_to_sqr(actor.position());

    if (npc_dist < distance) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function check_enemy_smart(actor: XR_game_object, npc: XR_game_object, params: [string]) {
  const enemy_id: number = registry.objects.get(npc.id()).enemy_id as number;
  const enemy: Optional<XR_game_object> = registry.objects.get(enemy_id)?.object as Optional<XR_game_object>;

  if (enemy === null || enemy_id === alife().actor().id) {
    return false;
  }

  const enemy_smart: Optional<SmartTerrain> = getObjectBoundSmart(enemy);

  return enemy_smart !== null && enemy_smart.name() === params[0];
}

/**
 * todo;
 */
export function zat_b103_actor_has_needed_food(actor: XR_game_object, npc: XR_game_object): boolean {
  return (
    get_global<AnyCallablesModule>("dialogs_zaton").zat_b103_actor_has_needed_food(actor, npc) ||
    hasAlifeInfo(info_portions.zat_b103_merc_task_done)
  );
}

/**
 * todo;
 */
export function zat_b29_rivals_dialog_precond(actor: XR_game_object, npc: XR_game_object): boolean {
  const squads_table = [
    "zat_b29_stalker_rival_default_1_squad",
    "zat_b29_stalker_rival_default_2_squad",
    "zat_b29_stalker_rival_1_squad",
    "zat_b29_stalker_rival_2_squad",
  ] as unknown as LuaArray<string>;
  const zones_table = [
    zones.zat_b29_sr_1,
    "zat_b29_sr_2",
    "zat_b29_sr_3",
    "zat_b29_sr_4",
    "zat_b29_sr_5",
  ] as unknown as LuaArray<TName>;

  let f_squad: boolean = false;

  for (const [k, v] of squads_table) {
    if (alife().object(alife().object<XR_cse_alife_creature_abstract>(npc.id())!.group_id)!.section_name() === v) {
      f_squad = true;
      break;
    }
  }

  if (!f_squad) {
    return false;
  }

  for (const [k, v] of zones_table) {
    if (isNpcInZone(npc, registry.zones.get(v))) {
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
    !hasAlifeInfo(info_portions.jup_b52_actor_items_can_be_stolen) &&
    !hasAlifeInfo(info_portions.jup_b202_actor_items_returned);
  const after: boolean =
    hasAlifeInfo(info_portions.jup_b52_actor_items_can_be_stolen) &&
    hasAlifeInfo(info_portions.jup_b202_actor_items_returned);

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
    (hasAlifeInfo(info_portions.jup_b16_oasis_found) ||
      hasAlifeInfo(info_portions.zat_b57_bloodsucker_lair_clear) ||
      hasAlifeInfo(info_portions.jup_b6_complete_end) ||
      hasAlifeInfo(info_portions.zat_b215_gave_maps)) &&
    hasAlifeInfo(info_portions.zat_b106_search_soroka)
  );
}

/**
 * todo;
 */
export function jup_b25_flint_gone_condition(): boolean {
  return (
    hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_duty) ||
    hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_freedom) ||
    hasAlifeInfo(info_portions.zat_b106_found_soroka_done)
  );
}

/**
 * todo;
 */
export function check_deimos_phase(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  if (params[0] && params[1]) {
    const obj: IStoredObject = registry.objects.get(npc.id());
    const delta: boolean = SchemeDeimos.check_intensity_delta(obj);

    if (params[1] === "increasing" && delta) {
      return false;
    } else if (params[1] === "decreasing" && !delta) {
      return false;
    }

    if (params[0] === "disable_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.check_disable_bound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.check_disable_bound(obj);
      }
    } else if (params[0] === "lower_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.check_lower_bound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.check_lower_bound(obj);
      }
    } else if (params[0] === "upper_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.check_upper_bound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.check_upper_bound(obj);
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function upgrade_hint_kardan(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const hint_table = new LuaTable();
  const tools: number = (params && tonumber(params[0])) || 0;
  let can_upgrade = 0;

  if (!hasAlifeInfo(info_portions.zat_b3_all_instruments_brought)) {
    if (!hasAlifeInfo(info_portions.zat_b3_tech_instrument_1_brought) && (tools === 0 || tools === 1)) {
      table.insert(hint_table, captions.st_upgr_toolkit_1);
    } else if (tools === 1) {
      can_upgrade = can_upgrade + 1;
    }

    if (!hasAlifeInfo(info_portions.zat_b3_tech_instrument_2_brought) && (tools === 0 || tools === 2)) {
      table.insert(hint_table, captions.st_upgr_toolkit_2);
    } else if (tools === 2) {
      can_upgrade = can_upgrade + 1;
    }

    if (!hasAlifeInfo(info_portions.zat_b3_tech_instrument_3_brought) && (tools === 0 || tools === 3)) {
      table.insert(hint_table, captions.st_upgr_toolkit_3);
    } else if (tools === 3) {
      can_upgrade = can_upgrade + 1;
    }
  } else {
    can_upgrade = can_upgrade + 1;
  }

  if (!hasAlifeInfo(info_portions.zat_b3_tech_see_produce_62)) {
    if (tools === 1 && !hasAlifeInfo(info_portions.zat_b3_tech_have_one_dose)) {
      table.insert(hint_table, captions.st_upgr_vodka);
    } else if (tools !== 1 && !hasAlifeInfo(info_portions.zat_b3_tech_have_couple_dose)) {
      table.insert(hint_table, captions.st_upgr_vodka);
    } else {
      can_upgrade = can_upgrade + 1;
    }
  } else {
    can_upgrade = can_upgrade + 1;
  }

  setCurrentHint(hint_table);

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
export function is_door_blocked_by_npc(actor: XR_game_object, obj: XR_game_object) {
  return obj.is_door_blocked_by_npc();
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
