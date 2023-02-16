import { alife, game, XR_alife_simulator, XR_game_object } from "xray16";

import { captions } from "@/mod/globals/captions";
import { info_portions } from "@/mod/globals/info_portions";
import { AnyArgs, Maybe, Optional } from "@/mod/lib/types";
import { IStoredObject, storage, zoneByName } from "@/mod/scripts/core/db";
import { setCurrentHint } from "@/mod/scripts/core/inventory_upgrades";
import { ActionDeimos } from "@/mod/scripts/core/logic/ActionDeimos";
import { AchievementsManager } from "@/mod/scripts/core/managers/AchievementsManager";
import { actor_in_cover } from "@/mod/scripts/core/SurgeManager";
import { get_sim_board } from "@/mod/scripts/se/SimBoard";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { getStoryObject } from "@/mod/scripts/utils/alife";
import {
  isActorAlive,
  isActorEnemy,
  isBlackScreen,
  isDistanceBetweenObjectsGreaterOrEqual,
  isDistanceBetweenObjectsLessOrEqual,
  isNpcInZone,
  isObjectWounded,
  isPlayingSound,
} from "@/mod/scripts/utils/checkers";
import { abort } from "@/mod/scripts/utils/debug";
import { get_npc_smart } from "@/mod/scripts/utils/gulag";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

import { npcInActorFrustum } from "./utils/physics";

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
  const zone: Optional<XR_game_object> = zoneByName.get(params[0]);

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
export function check_npc_name(actor: XR_game_object, npc: XR_game_object, params: LuaTable<number, string>): boolean {
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
export function check_enemy_name(
  actor: XR_game_object,
  npc: XR_game_object,
  params: LuaTable<number, string>
): boolean {
  const enemy_id: number = storage.get(npc.id()).enemy_id;
  const enemy: Maybe<XR_game_object> = storage.get(enemy_id)?.object;

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
  const smart: ISmartTerrain = get_npc_smart(npc)!;

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
  const smart = params && params[1] ? get_sim_board().get_smart_by_name(params[1]) : get_npc_smart(npc);

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
  const zone = zoneByName.get(params[1]);

  if (object && zone) {
    return zone.inside(alife().object(object)!.position);
  }

  return false;
}

/**

 *
 * export function actor_in_zone(actor, npc, p){
 *   const zone = db.zone_by_name[p[1]]
 *   return checkers.isNpcInZone(db.actor, zone)
 * }
 *
 * export function npc_in_zone(actor, npc, p){
 *   const zone = db.zone_by_name[p[1]]
 *
 *   if type(npc.id) !== "function" {{
 *     npc_obj = db.storage[npc.id] && db.storage[npc.id].object
 *     if zone === nil {
 *       return true
 *     }
 *
 *     if npc_obj === nil {
 *       return zone:inside(npc.position)
 *     }
 *   }else{
 *     npc_obj = npc
 *   }
 *
 *   return checkers.isNpcInZone(npc_obj, zone)
 * }

 export function heli_see_npc(actor, obj, p){
 *    if p[1] {
 *        const o = get_story_object( p[1] )
 *        return o !== nil && obj:get_helicopter():isVisible( o )
 *    }else{
 *        return false
 *    }
 * }
 *
 * export function heli_see_actor(actor, obj){
 *    return actor !== nil && obj:get_helicopter():isVisible( actor )
 * }

 * export function enemy_group(actor, npc, p){
 *    const enemy_id = db.storage[npc:id()].enemy_id
 *    const enemy = db.storage[enemy_id] && db.storage[enemy_id].object
 *    const g = enemy:group()
 *    const i, v = 0, 0
 *    for i, v in pairs(p) do
 *        if v === g {
 *
 *            return true
 *        }
 *    }
 *    return false
 * }
 *
 * export function gulag_state(actor, npc, p){
 *    if gulagUtils.getGulagState(p[1]) === p[2] {
 *        return true
 *    }
 *    return false
 * }
 * ]]--
 *
 * export function npc_community(actor, npc, p){
 *   const npc_obj
 *
 *   if p[1] === nil {
 *     abort("Wrong number of params in npc_community")
 *   }
 *
 *   if type(npc.id) !== "function" {{
 *     npc_obj = db.storage[npc.id] && db.storage[npc.id].object
 *
 *     if npc_obj === nil {
 *       return npc:community() === p[1]
 *     }
 *   }else{
 *     npc_obj = npc
 *   }
 *
 *   if character_community(npc_obj) === p[1] {
 *     return true
 *   }
 *   return false
 * }
 export function npc_rank(actor, npc, p){
 *    if p[1] === nil {
 *        abort("Wrong number of params in npc_rank")
 *    }
 *
 *    if ranks.get_obj_rank_name(npc) === p[1] {
 *        return true
 *    }
 *    return false
 * }
 *
 * export function npc_profile(actor, npc, p){
 *    if p[1] === nil {
 *        abort("Wrong number of params in npc_profile")
 *    }
 *    if npc:profile_name() === p[1] {
 *        return true
 *    }
 *    return false
 * }
 * ]]--

 * export function hitted_by(actor, npc, p){
 *   const npc1
 *   const t = db.storage[npc:id()].hit
 *   if t {
 *     for i, v in pairs(p) do
 *       npc1 = get_story_object(v)
 *       if npc1 && t.who === npc1:id() {
 *         return true
 *       }
 *     }
 *   }
 *   return false
 * }
 *
 * export function hitted_on_bone(actor, npc, p){
 *   for k, v in pairs(p) do
 *     if db.storage[npc:id()].hit.bone_index === npc:get_bone_id(v) {
 *       return true
 *     }
 *   }
 *   return false
 * }
 export function best_pistol(actor, npc){
 *   const pistol = npc:item_in_slot(1)
 *   if pistol !== nil {
 *     return true
 *   }else{
 *     return false
 *   }
 * }
 export function deadly_hit(actor, npc){
 *   if db.storage[npc:id()] === nil || db.storage[npc:id()].hit === nil {
 *
 *     return false
 *   }
   return db.storage[npc:id()].hit.deadly_hit === true
 * }

 export function killed_by(actor, npc, p){
 *   const npc1
 *   const t = db.storage[npc:id()].death
 *   if t {
 *     for i, v in pairs(p) do
 *       npc1 = get_story_object(v)
 *       if npc1 && t.killer === npc1:id() {
 *         printf("_bp: killed_by(%d)", v)
 *         return true
 *       }
 *     }
 *   }
 *   return false
 * }

 *
 * export function is_alive_all(actor, npc, p){
 *   const npc1
 *   for i, v in pairs(p) do
 *     npc1 = get_story_object_id(v)
 *     if npc1 === nil {
 *       return false
 *     }
 *     npc1 = alife():object(npc1)
 *     if npc1 && (! IsStalker(npc1) || !npc1:alive()) {
 *       return false
 *     }
 *   }
 *   return true
 * }

 *
 * export function is_alive_one(actor, npc, p){
 *   const npc1
 *   for i, v in pairs(p) do
 *     npc1 = get_story_object_id(v)
 *     if npc1 === nil {
 *       return false
 *     }
 *     npc1 = alife():object(npc1)
 *     if npc1 && IsStalker(npc1) && npc1:alive() {
 *       return true
 *     }
 *   }
 *   return false
 * }

 *
 * export function is_alive(actor, npc, p){
 *   const npc1
 *
 *   if npc === nil || (p && p[1]) {
 *     npc1 = get_story_object_id(p[1])
 *   }else if( (type(npc.id) === "number") {
 *     npc1 = npc.id
 *   }else{
 *     npc1 = npc:id()
 *   }
 *
 *   if npc1 === nil {
 *     return false
 *   }
 *
 *   npc1 = alife():object(npc1)
 *
 *   if npc1 && IsStalker(npc1) && npc1:alive() {
 *     return true
 *   }
 *
 *   return false
 * }

 *
 * export function is_dead_all(actor, npc, p){
 *   const npc1
 *   for i, v in pairs(p) do
 *     npc1 = get_story_object(v)
 *     if npc1 {
 *       if npc1:alive() {
 *         return false
 *       }else{
 *         printf("_bp: is_dead_all(%d) = true", v)
 *         return true
 *       }
 *     }
 *     return false
 *   }
 *   return true
 * }

 *
 * export function is_dead_one(actor, npc, p){
 *   const npc1
 *   for i, v in pairs(p) do
 *     npc1 = get_story_object(v)
 *     if !npc1 || !npc1:alive() {
 *       printf("_bp: is_dead_one(%d) = true", v)
 *       return true
 *     }
 *   }
 *   return false
 * }

 *
 * export function is_dead(actor, npc, p){
 *   const npc1
 *   npc1 = get_story_object(p[1])
 *   return !npc1 || !npc1:alive()
 * }
 export function story_object_exist(actor, npc, p){
 *   const npc1 = get_story_object(p[1])
 *   return npc1 !== nil
 * }

 * export function check_fighting(actor, npc, p){
 *    const enemy_id = db.storage[npc:id()].enemy_id
 *    const enemy = db.storage[enemy_id] && db.storage[enemy_id].object
 *    const sid
 *    if enemy && enemy:alive() {
 *            sid = enemy:story_id()
 *            for i, v in pairs(p) do
 *
 *                if type(v) === 'number' && sid === v {
 *
 *                    return true
 *                }
 *            }
 *    }
 *
 *    return false
 * }
 * ]]--

 *
 * export function actor_has_item(actor, npc, p){
 *   const story_actor = get_story_object("actor")
 *   return p[1] !== nil && story_actor && story_actor:object(p[1]) !== nil
 * }
 *
 * export function npc_has_item(actor, npc, p){
 *   return p[1] !== nil && npc:object(p[1]) !== nil
 * }
 *
 * export function actor_has_item_count(actor, npc, p){
 *   const item_section = p[1]
 *   const need_count = tonumber(p[2])
 *   const has_count = 0
 *   const function calc(temp, item){
 *
 *     if item:section() === item_section {
 *       has_count = has_count + 1
 *     }
 *   }
 *   actor:iterate_inventory(calc, actor)
 *   return has_count >= need_count
 * }
 export function signal(actor, npc, p){
 *   if p[1] {
 *     const st = db.storage[npc:id()]
 *     const sigs = st[st.active_scheme].signals
 *
 *     return sigs !== nil && sigs[p[1]] === true
 *   }else{
 *     return false
 *   }
 * }
 export function counter_greater(actor, npc, p){
 *   if p[1] && p[2] {
 *     const c = pstor.pstor_retrieve(actor, p[1], 0)
 *
 *     return c > p[2]
 *   }else{
 *     return false
 *   }
 * }
 * export function counter_equal(actor, npc, p){
 *   if p[1] && p[2] {
 *     const c = pstor.pstor_retrieve(actor, p[1], 0)
 *     return c === p[2]
 *   }else{
 *     return false
 *   }
 * }

 * export function odd_time_interval(actor, npc, p){
 *    return odd( game.time() / p[1] )
 * }
 * ]]--
 export function _kamp_talk(actor, npc){
 *   if db.kamp_stalkers[npc:id()] {
 *     return db.kamp_stalkers[npc:id()]
 *   }
 *
 *   return false
 * }
 *
 * export function _used(actor, npc){
 *   return npc:is_talking()
 * }

 * const alarm_statuses = {
 *   normal = SmartTerrainControl.ESmartTerrainStatus.NORMAL,
 *   danger = SmartTerrainControl.ESmartTerrainStatus.DANGER,
 *   alarm = SmartTerrainControl.ESmartTerrainStatus.ALARM
 * }
 export function check_smart_alarm_status(actor, npc, p){
 *   const smart_name = p[1]
 *   const status = alarm_statuses[p[2]]
 *
 *   if status === nil {
 *     abort("Wrong status[%s] in 'check_smart_alarm_status'", tostring(p[2]))
 *   }
 *
 *   const smart = SimBoard.get_sim_board():get_smart_by_name(smart_name)
 *   const smart_control = smart.base_on_actor_control
 *
 *   if smart_control === nil {
 *     abort("Cannot calculate 'check_smart_alarm_status' for smart %s", tostring(smart_name))
 *   }
 *
 *   return smart_control:get_status() === status
 * }
 export function has_enemy(actor, npc){
 *   return npc:best_enemy() !== nil
 * }
 *
 * export function has_actor_enemy(actor, npc){
 *   const best_enemy = npc:best_enemy()
 *   return best_enemy !== nil && best_enemy:id() === db.actor:id()
 * }
 *
 * export function see_enemy(actor, npc){
 *   const enemy = npc:best_enemy()
 *
 *   if enemy !== nil {
 *     return npc:see(enemy)
 *   }
 *   return false
 * }
 *
 * export function has_enemy_in_current_loopholes_fov(actor, npc){
 *   return npc:in_smart_cover() && npc:best_enemy() !== nil && npc:in_current_loophole_fov(npc:best_enemy():position())
 * }
 *
 * export function talking(actor, npc){
 *   return actor:is_talking()
 * }
 *
 * export function npc_talking(actor, npc){
 *   return npc:is_talking()
 * }
 *
 * export function see_actor(actor, npc){
 *   return npc:alive() && npc:see(actor)
 * }
 *
 * export function actor_enemy(actor, npc){
 *   const t = db.storage[npc:id()].death
 *   return npc:relation(actor) === game_object.enemy || (t !== nil && t.killer === actor:id())
 * }
 *
 * export function actor_fri}(actor, npc){
 *   return npc:relation(actor) === game_object.fri}
 * }
 *
 * export function actor_neutral(actor, npc){
 *   return npc:relation(actor) === game_object.neutral
 * }
 *
 * export function is_factions_enemies(actor, npc, p){
 *   if (p[1] !== nil) {
 *     return game_relations.is_factions_enemies(character_community(actor), p[1])
 *   }else{
 *     return false
 *   }
 * }
 *
 * export function is_factions_neutrals(actor, npc, p){
 *   return !(is_factions_enemies(actor, npc, p) || is_factions_fri}s(actor, npc, p))
 * }
 *
 * export function is_factions_fri}s(actor, npc, p){
 *   if (p[1] !== nil) {
 *     return game_relations.is_factions_fri}s(character_community(actor), p[1])
 *   }else{
 *     return false
 *   }
 * }
 *
 * export function is_faction_enemy_to_actor(actor, npc, p){
 *   if (p[1] !== nil) {
 *
 *     return relation_registry.community_goodwill(p[1], db.actor:id()) <= -1000
 *   }else{
 *     return false
 *   }
 * }
 *
 * export function is_faction_fri}_to_actor(actor, npc, p){
 *   if (p[1] !== nil) {
 *
 *     return relation_registry.community_goodwill(p[1], db.actor:id()) >= 1000
 *   }else{
 *     return false
 *   }
 * }
 *
 * export function is_faction_neutral_to_actor(actor, npc, p){
 *   return !(is_faction_enemy_to_actor(actor, npc, p) || is_faction_fri}_to_actor(actor, npc, p))
 * }
 *
 * export function is_squad_fri}_to_actor(actor, npc, p){
 *   if (p[1] !== nil) {
 *
 *     return game_relations.check_all_squad_members(p[1], "fri}")
 *   }else{
 *
 *     return false
 *   }
 * }
 *
 * export function is_squad_enemy_to_actor(actor, npc, p){
 *   if !p {
 *     abort("Not enough arguments in 'is_squad_enemy_to_actor' funciton!")
 *   }
 *
 *   for k, v in pairs(p) do
 *
 *     if game_relations.check_all_squad_members(v, "enemy") {
 *       return true
 *     }
 *   }
 *
 *   return false
 * }
 *
 * export function is_squad_neutral_to_actor(actor, npc, p){
 *   return !(is_squad_enemy_to_actor(actor, npc, p) || is_squad_fri}_to_actor(actor, npc, p))
 * }
 export function fighting_actor(actor, npc){
 *   const enemy_id = db.storage[npc:id()].enemy_id
 *   const enemy = db.storage[enemy_id] && db.storage[enemy_id].object
 *   return enemy && enemy:id() === actor:id()
 * }
 *
 * export function hit_by_actor(actor, npc){
 *   const t = db.storage[npc:id()].hit
 *   const hit_by_actor = (t !== nil && t.who === actor:id())
 *   return hit_by_actor
 * }
 *
 * export function killed_by_actor(actor, npc){
 *   const t = db.storage[npc:id()].death
 *   const killed_by_actor = t !== nil && t.killer === actor:id()
 *   return killed_by_actor
 * }
 *
 * export function actor_has_weapon (actor, npc){
 *   const obj = actor:active_item()
 *   if obj === nil || isWeapon(obj) === false {
 *     return false
 *   }
 *   return true
 * }
 *
 * export function actor_active_detector(actor, npc, p){
 *   const detector_section = p && p[1]
 *   if detector_section === nil {
 *     abort("Wrong parameters in function 'actor_active_detector'"){
 *   }
 *   const actor_detector = db.actor:active_detector()
 *   return (actor_detector !== nil) && actor_detector:section() === detector_section
 * }
 *
 * export function heavy_wounded(actor, npc){
 *   return checkers.isHeavilyWounded(npc:id())
 * }
 �������� �� �������� ������ �������
 * ����� �������� � �������
 * ���������: (time_shift:period_min)
 *                     time_shift - ������������� ������������
 *                     period - ������ ������������ �� ������� �� �������� true
 *
 * �������:
 * time_period(60:10) - ���������� true ������ ��� �� ���������� ������ 10 �����
 *
 * export function time_period(actor, npc, p){
 *   const tshift, period = p[1], p[2]
 *   if tshift !== nil && period !== nil && db.actor !== nil {
 *     return tshift > period && level.get_time_minutes() % tshift <= period
 *   }
 *   return false
 * }
 *
 * export function is_rain (actor, npc){
 *   return db.actor !== nil && level.rain_factor() > 0
 * }
 *
 * export function is_heavy_rain (actor, npc){
 *   return db.actor !== nil && level.rain_factor() >= 0.5
 * }
 *
 * export function is_day (actor, npc){
 *   return db.actor !== nil && level.get_time_hours() >= 6 && level.get_time_hours() < 21
 * }
 *
 * export function is_dark_night (actor, npc){
 *   return db.actor !== nil && (level.get_time_hours() < 3 || level.get_time_hours() > 22)
 * }
 *
 * export function is_jup_a12_mercs_time (actor, npc){
 *   return db.actor !== nil && (level.get_time_hours() >= 1 && level.get_time_hours() < 5)
 * }
 *
 * export function zat_b7_is_night (actor, npc){
 *   return db.actor !== nil && (level.get_time_hours() >= 23 || level.get_time_hours() < 5)
 * }
 *
 * export function zat_b7_is_late_attack_time (actor, npc){
 *   return db.actor !== nil && (level.get_time_hours() >= 23 || level.get_time_hours() < 9)
 * }
 *
 * export function mob_has_enemy(actor, npc){
 *
 *   if npc === nil {
 *     return false
 *   }
 *
 *   return npc:get_enemy() !== nil
 * }
 *
 * export function mob_was_hit(actor, npc){
 *   const h = npc:get_monster_hit_info()
 *   if h.who && h.time !== 0 {
 *     return true
 *   }
 *   return false
 * }
 *
 * export function actor_on_level(actor, npc, p){
 *   for k, v in pairs(p) do
 *
 *     if v === level.name() {
 *       return true
 *     }
 *   }
 *   return false
 * }
 *
 * export function treasure_exist(actor, npc, p){
 *
 *   return true
 * }

 * export function cover_attack(actor, npc){
 *
 *    const squad = get_object_squad(npc)
 *
 *    if squad === nil {
 *        return false
 *    }
 *
 *    return squad:cover_attack()
 * }
 * ]]--

 *
 * export function squad_in_zone(actor, npc, p){
 *   const story_id = p[1]
 *   const zone_name = p[2]
 *   if story_id === nil {
 *     abort("Insufficient params in squad_in_zone function. story_id[%s], zone_name[%s]", tostring(story_id), tostring(zone_name)){
 *   }
 *   if zone_name === nil {
 *     zone_name = npc:name()
 *   }
 *
 *   const squad = get_story_squad(story_id)
 *   if squad === nil {
 *
 *     return false
 *   }
 *
 *   const zone = db.zone_by_name[zone_name]
 *   if zone === nil {
 *
 *     return false
 *   }
 *
 *   for k in squad:squad_members() do
 *     const position = (db.storage[k.id] && db.storage[k.id].object && db.storage[k.id].object:position()) || k.object.position
 *     if zone:inside(position) {
 *       return true
 *     }
 *   }
 *   return false
 * }
 *
 * export function squad_has_enemy(actor, npc, p){
 *   const story_id = p[1]
 *
 *   if story_id === nil {
 *     abort("Insufficient params in squad_has_enemy function. story_id [%s]", tostring(story_id)){
 *   }
 *
 *   const squad = get_story_squad(story_id)
 *   if squad === nil {
 *
 *     return false
 *   }
 *
 *   const al = alife()
 *   for k in squad:squad_members() do
 *     const npc_obj = level.object_by_id(k.object.id)
 *     if npc_obj === nil {
 *       return false
 *     }
 *     if npc_obj:best_enemy() !== nil {
 *       return true
 *     }
 *   }
 *
 *   return false
 * }
 export function squad_in_zone_all(actor, npc, p){
 *   const story_id = p[1]
 *   const zone_name = p[2]
 *   if story_id === nil || zone_name === nil {
 *     abort("Insufficient params in squad_in_zone_all function. story_id[%s], zone_name[%s]", tostring(story_id), tostring(zone_name)){
 *   }
 *   const squad = get_story_squad(story_id)
 *   if squad === nil {
 *
 *     return false
 *   }
 *   const zone = db.zone_by_name[zone_name]
 *   if zone === nil {
 *
 *     return false
 *   }
 *   const al = alife()
 *   for k in squad:squad_members() do
 *     const position = (db.storage[k.id] && db.storage[k.id].object && db.storage[k.id].object:position()) || k.object.position
 *     if !zone:inside(position) {
 *       return false
 *     }
 *   }
 *   return true
 * }
 *
 * export function squads_in_zone_b41(actor, npc, p){
 *   const smart = SimBoard.get_sim_board():get_smart_by_name("jup_b41")
 *   const zone = db.zone_by_name["jup_b41_sr_light"]
 *
 *   if zone === nil {
 *     return false
 *   }
 *   if smart === nil {
 *     return false
 *   }
 *
 *   for k, v in pairs(SimBoard.get_sim_board().smarts[smart.id].squads) do
 *     if v !== nil {
 *       for j in v:squad_members() do
 *         if !zone:inside(j.object.position) {
 *           return false
 *         }
 *       }
 *     }
 *   }
 *
 *   return true
 * }

 * export function target_squad_name(actor, obj, p){
 *   if p[1] === nil {
 *     abort("Wrong parameters")
 *   }
 *   if !(obj) {
 *     return false
 *   }
 *
 *   if IsStalker(obj) || IsMonster(obj) {
 *     if alife():object(obj.group_id) === nil {
 *       return false
 *     }
 *     if string.find(alife():object(obj.group_id):section_name(), p[1]) !== nil {
 *       return true
 *     }
 *
 *   }
 *   return obj:section_name() === p[1]
 * }
 export function target_smart_name(actor, smart, p){
 *   if p[1] === nil {
 *     abort("Wrong parameters")
 *   }
 *
 *   return smart:name() === p[1]
 * }
 export function squad_exist(actor, npc, p){
 *   const story_id = p[1]
 *   if story_id === nil {
 *     abort("Wrong parameter story_id[%s] in squad_exist function", tostring(story_id)){
 *   }
 *   const squad = get_story_squad(story_id)

 *
 *   return squad !== nil
 *
 * }
 *
 * export function is_squad_commander(actor, npc){
 *   if (type(npc.id) === "number") {
 *     npc_id = npc.id
 *   }else{
 *     npc_id = npc:id()
 *   }
 *   const squad = get_object_squad(npc)
 *   return squad !== nil && squad:commander_id() === npc_id
 * }
 *
 * export function squad_npc_count_ge(actor, npc, p){
 *   const story_id = p[1]
 *   if story_id === nil {
 *     abort("Wrong parameter squad_id[%s] in 'squad_npc_count_ge' function", tostring(squad_id)){
 *   }
 *   const squad = get_story_squad(story_id)
 *
 *   if squad {
 *     return squad:npc_count() > tonumber(p[2])
 *   }else{
 *     return false
 *   }
 * }
 *
 * export function surge_complete(){
 *   return SurgeManager.is_finished()
 * }
 *
 * export function surge_started(){
 *   return SurgeManager.is_started()
 * }
 *
 * export function surge_kill_all(){
 *   return SurgeManager.is_killing_all()
 * }
 *
 * export function signal_rocket_flying(actor, npc, p){
 *   if p === nil {
 *     abort("Signal rocket name is !set!")
 *   }
 *   if db.signal_light[p[1]] {
 *     return db.signal_light[p[1]]:is_flying()
 *   }else{
 *     abort("No such signal rocket: [%s] on level", tostring(p[1]))
 *   }
 *   return false
 * }
 *
 * export function quest_npc_enemy_actor(actor, npc, p){
 *   if p[1] === nil {
 *     abort("wrong story id")
 *   }else{
 *     const obj = get_story_object(p[1])
 *     if obj && IsStalker(obj) {
 *       if db.actor && obj:general_goodwill(db.actor) <= -1000 {
 *         return true
 *       }
 *     }
 *   }
 *   return false
 * }
 *
 * export function animpoint_reached(actor, npc){
 *   const animpoint_storage = db.storage[npc:id()].animpoint
 *
 *   if animpoint_storage === nil {
 *     return false
 *   }
 *
 *   const animpoint_class = animpoint_storage.animpoint
 *
 *   return animpoint_class:position_riched()
 * }
 export function npc_stay_offline(actor, npc, p){
 *    if p === nil {
 *        abort("Wrong parameter!!!")
 *    }
 *    if npc && db.actor {
 *        if is_smart_in_combat(actor, npc, p) {
 *            if npc.position:distance_to(db.actor:position())>=30 || game_relations.get_gulag_relation_actor(p[1], "enemy") {
 *                return true
 *            }
 *        }
 *    }
 *    return false
 * }
 * ]]--

 * export function distance_to_obj_ge(actor, npc, p){
 *   const npc_id = get_story_object_id(p[1])
 *   const npc1 = npc_id && alife():object(npc_id)
 *   if npc1 {
 *     return db.actor:position():distance_to_sqr(npc1.position) >= p[2] * p[2]
 *   }
 *   return false
 * }
 *
 * export function distance_to_obj_le(actor, npc, p){
 *   const npc_id = get_story_object_id(p[1])
 *   const npc1 = npc_id && alife():object(npc_id)
 *   if npc1 {
 *     return db.actor:position():distance_to_sqr(npc1.position) < p[2] * p[2]
 *   }
 *   return false
 * }
 *
 * export function in_dest_smart_cover(actor, npc, p){
 *   return npc:in_smart_cover()
 * }
 *
 * export function active_item(actor, npc, p){
 *   if p && p[1] {
 *     for k, v in pairs(p) do
 *       if actor:item_in_slot(3) !== nil && actor:item_in_slot(3):section() === v {
 *         return true
 *       }
 *     }
 *   }
 *   return false
 * }
 *
 * export function actor_nomove_nowpn(){
 *   if (! isWeapon(db.actor:active_item())) || db.actor:is_talking() {
 *     return true
 *   }
 *   return false
 * }
 *
 * export function jup_b16_is_zone_active(actor, npc){
 *   return hasAlifeInfo(npc:name())
 * }

 export function check_bloodsucker_state(actor, npc, p){
 *   if (p && p[1]) === nil {
 *     abort("Wrong parameters in function 'check_bloodsucker_state'!!!"){
 *   }
 *   const state = p[1]
 *   if p[2] !== nil {
 *     state = p[2]
 *     npc = get_story_object(p[1])
 *   }
 *   if npc !== nil {
 *     return npc:get_visibility_state() === tonumber(state)
 *   }
 *   return false
 * }
 *
 * export function dist_to_story_obj_ge(actor, npc, p){
 *   const story_id = p && p[1]
 *   const story_obj_id = get_story_object_id(story_id)
 *   if story_obj_id === nil {
 *     return true
 *   }
 *   const se_obj = alife():object(story_obj_id)
 *   return se_obj.position:distance_to(db.actor:position()) > p[2]
 * }
 *
 * export function actor_has_nimble_weapon(actor, npc){
 *   const need_item = {}
 *   need_item["wpn_groza_nimble"] = true
 *   need_item["wpn_desert_eagle_nimble"] = true
 *   need_item["wpn_fn2000_nimble"] = true
 *   need_item["wpn_g36_nimble"] = true
 *   need_item["wpn_protecta_nimble"] = true
 *   need_item["wpn_mp5_nimble"] = true
 *   need_item["wpn_sig220_nimble"] = true
 *   need_item["wpn_spas12_nimble"] = true
 *   need_item["wpn_usp_nimble"] = true
 *   need_item["wpn_vintorez_nimble"] = true
 *   need_item["wpn_svu_nimble"] = true
 *   need_item["wpn_svd_nimble"] = true
 *   for k, v in pairs(need_item) do
 *     if actor:object(k) !== nil {
 *       return true
 *     }
 *   }
 *   return false
 * }
 *
 * export function actor_has_active_nimble_weapon(actor, npc){
 *   const need_item = {}
 *   need_item["wpn_groza_nimble"] = true
 *   need_item["wpn_desert_eagle_nimble"] = true
 *   need_item["wpn_fn2000_nimble"] = true
 *   need_item["wpn_g36_nimble"] = true
 *   need_item["wpn_protecta_nimble"] = true
 *   need_item["wpn_mp5_nimble"] = true
 *   need_item["wpn_sig220_nimble"] = true
 *   need_item["wpn_spas12_nimble"] = true
 *   need_item["wpn_usp_nimble"] = true
 *   need_item["wpn_vintorez_nimble"] = true
 *   need_item["wpn_svu_nimble"] = true
 *   need_item["wpn_svd_nimble"] = true
 *
 *   if actor:item_in_slot(2) !== nil && need_item[actor:item_in_slot(2):section()] === true {
 *     return true
 *   }
 *   if actor:item_in_slot(3) !== nil && need_item[actor:item_in_slot(3):section()] === true {
 *     return true
 *   }
 *   return false
 * }
 *
 * export function jup_b202_inventory_box_empty(actor, npc){
 *   const inv_box = get_story_object("jup_b202_actor_treasure")
 *   return inv_box:is_inv_box_empty()
 * }
 *
 * export function jup_b46_actor_has_active_science_detector(actor, npc){
 *    if actor:item_in_slot(9) !== nil && actor:item_in_slot(9):section() === "detector_scientific" { return true }
 *    return false
 * }
 * ]]--
 * export function is_in_danger(actor, npc, p){
 *   if p && p[1] {
 *     npc = get_story_object(p[1])
 *   }
 *
 *   return db.storage[npc:id()].danger_flag
 * }
 *
 * export function object_exist(actor, npc, p){
 *   return get_story_object(p[1]) !== nil
 * }
 *
 * export function squad_curr_action(actor, npc, p){
 *   const squad = get_object_squad(npc)
 *   return squad.current_action && squad.current_action.name === p[1]
 * }
 *
 * export function is_monster_snork(actor, npc){
 *   return npc:clsid() === clsid.snork_s
 * }
 *
 * export function is_monster_dog(actor, npc){
 *   return npc:clsid() === clsid.dog_s
 * }
 *
 * export function is_monster_psy_dog(actor, npc){
 *   return npc:clsid() === clsid.psy_dog_s
 * }
 *
 * export function is_monster_polter(actor, npc){
 *   return npc:clsid() === clsid.poltergeist_s
 * }
 *
 * export function is_monster_tushkano(actor, npc){
 *   return npc:clsid() === clsid.tushkano_s
 * }
 *
 * export function is_monster_burer(actor, npc){
 *   return npc:clsid() === clsid.burer_s
 * }
 *
 * export function is_monster_controller(actor, npc){
 *   return npc:clsid() === clsid.controller_s
 * }
 *
 * export function is_monster_flesh(actor, npc){
 *   return npc:clsid() === clsid.flesh_s
 * }
 *
 * export function is_monster_boar(actor, npc){
 *   return npc:clsid() === clsid.boar_s
 * }
 *
 * export function dead_body_searching(actor, npc){
 *
 *   const actorMenu = require("scripts.ui.game.ActorMenu").actorMenu
 *   return actorMenu:isActiveMode(4)
 * }
 *
 * export function jup_b47_npc_online(actor, npc, p){
 *
 *   const story_obj = get_story_object(p[1])
 *   if story_obj === nil {
 *     return false
 *   }
 *   const obj = alife():object(story_obj:id())
 *   return obj !== nil
 * }
 *
 * export function anomaly_has_artefact(actor, npc, p){
 *   const az_name = p && p[1]
 *   const af_name = p && p[2]
 *
 *   const anomal_zone = db.anomaly_by_name[az_name]
 *   if anomal_zone === nil {
 *     return false
 *   }
 *
 *   if anomal_zone.spawned_count < 1 {
 *     return false
 *   }
 *
 *   if af_name === nil {
 *     const af_table = {}
 *     for k, v in pairs(AnomalyZoneBinder.ARTEFACT_WAYS_BY_ARTEFACT_ID) do
 *       if alife():object(tonumber(k)) {
 *         table.insert(af_table, alife():object(tonumber(k)):section_name())
 *       }
 *     }
 *     return true, af_table
 *   }
 *
 *   for k, v in pairs(AnomalyZoneBinder.ARTEFACT_WAYS_BY_ARTEFACT_ID) do
 *     if alife():object(tonumber(k)) && af_name === alife():object(tonumber(k)):section_name() {
 *       return true
 *     }
 *   }
 *
 *   return false
 * }
 *
 * export function zat_b29_anomaly_has_af(actor, npc, p){
 *   const az_name = p && p[1]
 *   const af_name
 *
 *   const anomal_zone = db.anomaly_by_name[az_name]
 *   if anomal_zone === nil {
 *     return false
 *   }
 *
 *   if anomal_zone.spawned_count < 1 {
 *     return false
 *   }
 *
 *   for i = 16, 23 do
 *     if hasAlifeInfo(dialogs_zaton.zat_b29_infop_bring_table[i]) {
 *       af_name = dialogs_zaton.zat_b29_af_table[i]
 *       break
 *     }
 *   }
 *
 *   for k, v in pairs(AnomalyZoneBinder.ARTEFACT_WAYS_BY_ARTEFACT_ID) do
 *     if alife():object(tonumber(k)) && af_name === alife():object(tonumber(k)):section_name() {
 *       db.actor:give_info_portion(az_name)
 *       return true
 *     }
 *   }
 *
 *   return false
 * }
 *
 * export function jup_b221_who_will_start(actor, npc, p){
 *
 *   const reachable_theme = {}
 *   const faction_table = {}
 *   const info_table = {
 *
 *     [1] = "jup_b25_freedom_flint_gone",
 *     [2] = "jup_b25_flint_blame_done_to_duty",
 *     [3] = "jup_b4_monolith_squad_in_duty",
 *     [4] = "jup_a6_duty_leader_bunker_guards_work",
 *     [5] = "jup_a6_duty_leader_employ_work",
 *     [6] = "jup_b207_duty_wins",
 *
 *     [7] = "jup_b207_freedom_know_about_depot",
 *     [8] = "jup_b46_duty_founder_pda_to_freedom",
 *     [9] = "jup_b4_monolith_squad_in_freedom",
 *     [10] = "jup_a6_freedom_leader_bunker_guards_work",
 *     [11] = "jup_a6_freedom_leader_employ_work",
 *     [12] = "jup_b207_freedom_wins"
 *   }
 *
 *   for k, v in pairs(info_table) do
 *     if k <= 6 {
 *       faction_table[1] = "duty"
 *       faction_table[2] = "0"
 *     }else{
 *       faction_table[1] = "freedom"
 *       faction_table[2] = "6"
 *     }
 *     if (hasAlifeInfo(v)) && (! hasAlifeInfo("jup_b221_" .. faction_table[1] .. "_main_" .. tostring(k - tonumber(faction_table[2])) .. "_played")) {
 *       table.insert(reachable_theme, k)
 *       printf("jup_b221_who_will_start: table reachable_theme
 *     }
 *   }
 *   if (p && p[1]) === nil {
 *     abort("No such parameters in function 'jup_b221_who_will_start'"){
 *   }
 *   if tostring(p[1]) === "ability" {
 *     return #reachable_theme !== 0
 *   }else if( tostring(p[1]) === "choose" {
 *
 *     return reachable_theme[math.random(1, #reachable_theme)] <= 6
 *   }else{
 *     abort("Wrong parameters in function 'jup_b221_who_will_start'"){
 *   }
 * }
 *
 * export function pas_b400_actor_far_forward(actor, npc){
 *   const fwd_obj = get_story_object("pas_b400_fwd")
 *
 *   if fwd_obj {
 *     if distance_between(fwd_obj, db.actor) > distance_between(fwd_obj, npc) {
 *       return false
 *     }
 *   }else{
 *     return false
 *   }
 *
 *   const distance = 70 * 70
 *   const self_dist = npc:position():distance_to_sqr(actor:position())
 *   if self_dist < distance {
 *     return false
 *   }
 *
 *   const squad = alife():object(alife():object(npc:id()).group_id)
 *
 *   for k in squad:squad_members() do
 *     const other_dist = k.object.position:distance_to_sqr(actor:position())
 *     if other_dist < distance {
 *       return false
 *     }
 *   }

 *   return true
 * }
 *
 * export function pas_b400_actor_far_backward(actor, npc){
 *   const bwd_obj = get_story_object("pas_b400_bwd")
 *
 *   if bwd_obj {
 *     if distance_between(bwd_obj, db.actor) > distance_between(bwd_obj, npc) {
 *       return false
 *     }
 *   }else{
 *     return false
 *   }
 *
 *   const distance = 70 * 70
 *   const self_dist = npc:position():distance_to_sqr(actor:position())
 *   if self_dist < distance {
 *     return false
 *   }
 *
 *   const squad = alife():object(alife():object(npc:id()).group_id)
 *
 *   for k in squad:squad_members() do
 *     const other_dist = k.object.position:distance_to_sqr(actor:position())
 *     if other_dist < distance {
 *       return false
 *     }
 *   }

 *   return true
 * }
 *
 * export function pri_a28_actor_is_far(actor, npc){
 *   const distance = 150 * 150
 *   const squad = get_story_squad("pri_a16_military_squad")
 *
 *   for k in squad:squad_members() do
 *     const npc_dist = k.object.position:distance_to_sqr(actor:position())
 *     if npc_dist < distance {
 *       return false
 *     }
 *   }
 *
 *   return true
 * }
 *
 * export function check_enemy_smart(actor, npc, p){
 *   const enemy_id = db.storage[npc:id()].enemy_id
 *   const enemy = db.storage[enemy_id] && db.storage[enemy_id].object
 *   if enemy === nil || enemy_id === alife():actor().id {
 *     return false
 *   }
 *   const enemy_smart = gulagUtils.get_npc_smart(enemy)
 *
 *   if (enemy_smart !== nil) && (enemy_smart:name() === p[1]) {
 *     return true
 *   }
 *   return false
 * }
 *
 * export function zat_b103_actor_has_needed_food(actor, npc, p){
 *   return (dialogs_zaton.zat_b103_actor_has_needed_food(actor, npc)) || (hasAlifeInfo("zat_b103_merc_task_done"))
 * }
 *
 * export function zat_b29_rivals_dialog_precond(actor, npc){
 *   const squads_table = {
 *     "zat_b29_stalker_rival_default_1_squad",
 *     "zat_b29_stalker_rival_default_2_squad",
 *     "zat_b29_stalker_rival_1_squad",
 *     "zat_b29_stalker_rival_2_squad"
 *   }
 *
 *   const zones_table = {
 *     "zat_b29_sr_1",
 *     "zat_b29_sr_2",
 *     "zat_b29_sr_3",
 *     "zat_b29_sr_4",
 *     "zat_b29_sr_5",
 *   }
 *
 *   const f_squad = false
 *
 *   for k, v in pairs(squads_table) do
 *     if alife():object(alife():object(npc:id()).group_id):section_name() === v {
 *       f_squad = true
 *       break
 *     }
 *   }
 *
 *   if !f_squad {
 *     return false
 *   }
 *
 *   for k, v in pairs(zones_table) do
 *     if checkers.isNpcInZone(npc, db.zone_by_name[v]) {
 *       return true
 *     }
 *   }
 *
 *   return false
 * }
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
export function polter_ignore_actor(actor: XR_game_object, npc: XR_game_object) {
  return npc.poltergeist_get_actor_ignore();
}

export function burer_gravi_attack(actor: XR_game_object, npc: XR_game_object) {
  return npc.burer_get_force_gravi_attack();
}

export function burer_anti_aim(actor: XR_game_object, npc: XR_game_object) {
  return npc.burer_get_force_anti_aim();
}

export function jup_b25_senya_spawn_condition(): boolean {
  return (
    (hasAlifeInfo(info_portions.jup_b16_oasis_found) ||
      hasAlifeInfo(info_portions.zat_b57_bloodsucker_lair_clear) ||
      hasAlifeInfo(info_portions.jup_b6_complete_end) ||
      hasAlifeInfo(info_portions.zat_b215_gave_maps)) &&
    hasAlifeInfo(info_portions.zat_b106_search_soroka)
  );
}

export function jup_b25_flint_gone_condition(): boolean {
  return (
    hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_duty) ||
    hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_freedom) ||
    hasAlifeInfo(info_portions.zat_b106_found_soroka_done)
  );
}

function check_deimos_phase(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  if (params[0] && params[1]) {
    const obj: IStoredObject = storage.get(npc.id());
    const delta: boolean = ActionDeimos.check_intensity_delta(obj);

    if (params[1] === "increasing" && delta) {
      return false;
    } else if (params[1] === "decreasing" && !delta) {
      return false;
    }

    if (params[0] === "disable_bound") {
      if (params[1] === "increasing") {
        if (!ActionDeimos.check_disable_bound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return ActionDeimos.check_disable_bound(obj);
      }
    } else if (params[0] === "lower_bound") {
      if (params[1] === "increasing") {
        if (!ActionDeimos.check_lower_bound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return ActionDeimos.check_lower_bound(obj);
      }
    } else if (params[0] === "upper_bound") {
      if (params[1] === "increasing") {
        if (!ActionDeimos.check_upper_bound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return ActionDeimos.check_upper_bound(obj);
      }
    }
  }

  return false;
}

function upgrade_hint_kardan(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
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

function actor_in_surge_cover(actor: XR_game_object, npc: XR_game_object): boolean {
  return actor_in_cover();
}

function is_door_blocked_by_npc(actor: XR_game_object, obj: XR_game_object) {
  return obj.is_door_blocked_by_npc();
}

function has_active_tutorial(): boolean {
  return game.has_active_tutorial();
}

export function wealthy_functor(): boolean {
  return AchievementsManager.getInstance().checkAchievedWealthy();
}
