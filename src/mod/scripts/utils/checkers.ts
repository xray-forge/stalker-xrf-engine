import {
  alife,
  clsid,
  device,
  game_graph,
  system_ini,
  TXR_cls_id,
  XR_action_planner,
  XR_alife_simulator,
  XR_cse_abstract,
  XR_cse_alife_human_stalker,
  XR_cse_alife_item_artefact,
  XR_cse_alife_monster_abstract,
  XR_cse_alife_object,
  XR_game_object,
} from "xray16";

import { squadMonsters } from "@/mod/globals/behaviours";
import { artefact_class_ids, monster_class_ids, stalker_class_ids, weapon_class_ids } from "@/mod/globals/class_ids";
import { TCommunity } from "@/mod/globals/communities";
import { ammo, TAmmoItem } from "@/mod/globals/items/ammo";
import {
  lootable_table,
  lootable_table_exclude,
  TLootableExcludeItem,
  TLootableItem,
} from "@/mod/globals/items/lootable_table";
import { levels, TLevel } from "@/mod/globals/levels";
import { surgeConfig } from "@/mod/lib/configs/SurgeConfig";
import { Maybe, Optional, TSection } from "@/mod/lib/types";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { getActor, IStoredObject, storage, zoneByName } from "@/mod/scripts/core/db";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { abort } from "@/mod/scripts/utils/debug";
import { getClsId, getObjectStoryId } from "@/mod/scripts/utils/ids";

/**
 * todo;
 */
export function isMonster(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_cls_id>
): object is XR_cse_alife_monster_abstract {
  const id: TXR_cls_id = class_id || getClsId(object);

  return monster_class_ids[id] === true;
}

/**
 * todo;
 */
export function isSquadMonsterCommunity(community: TCommunity): boolean {
  return squadMonsters[community] === true;
}

/**
 * todo;
 */
export function isStalker(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_cls_id>
): object is XR_cse_alife_human_stalker {
  const id: TXR_cls_id = class_id || getClsId(object);

  return stalker_class_ids[id] === true;
}

/**
 * todo;
 */
export function isStalkerClassId(class_id: number): boolean {
  return class_id === clsid.stalker || class_id === clsid.script_stalker;
}

/**
 * todo;
 */
export function isWeapon(object: Optional<XR_game_object | XR_cse_abstract>, class_id?: Maybe<TXR_cls_id>): boolean {
  if (object === null) {
    return false;
  }

  const id: TXR_cls_id = class_id || getClsId(object);

  return weapon_class_ids[id] === true;
}

/**
 * todo;
 */
export function isGrenade(object: Optional<XR_game_object | XR_cse_abstract>, class_id?: Maybe<TXR_cls_id>): boolean {
  if (object === null) {
    return false;
  }

  const id: TXR_cls_id = class_id || getClsId(object);

  return id === clsid.wpn_grenade_rgd5_s || id === clsid.wpn_grenade_f1_s;
}

/**
 * Is provided object artefact.
 */
export function isArtefact(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_cls_id>
): object is XR_cse_alife_item_artefact {
  const id: TXR_cls_id = class_id || getClsId(object);

  return artefact_class_ids[id] === true;
}

/**
 * todo;
 */
export function isStrappableWeapon(object: Optional<XR_game_object>): object is XR_game_object {
  return object === null ? false : system_ini().line_exist(object.section(), "strap_bone0");
  /* --[[
      local id = get_clsid(obj)
    if id === nil then return false end

    if id === clsid.wpn_vintorez_s then return true
    elseif id === clsid.wpn_ak74_s then return true
    elseif id === clsid.wpn_lr300_s then return true
    elseif id === clsid.wpn_shotgun_s then return true
    elseif id === clsid.wpn_bm16_s then return true
    elseif id === clsid.wpn_svd_s then return true
    elseif id === clsid.wpn_svu_s then return true
    elseif id === clsid.wpn_rpg7_s then return true
    elseif id === clsid.wpn_val_s then return true
    elseif id === clsid.wpn_groza_s then return true
    else return false end
  ]]*/
}

/**
 * @returns whether provided object is on a provided level.
 */
export function isObjectOnLevel(object: Optional<XR_cse_alife_object>, levelName: string): boolean {
  return object !== null && alife().level_name(game_graph().vertex(object.m_game_vertex_id).level_id()) === levelName;
}

/**
 * todo: Probably also lab?
 * @returns whether level is fully indoor.
 */
export function isUndergroundLevel(level: TLevel): boolean {
  return level === levels.jupiter_underground || level === levels.labx8;
}

/**
 * @returns whether provided community squad is immune to surge.
 */
export function isImmuneToSurge(object: ISimSquad): boolean {
  return surgeConfig.IMMUNE_SQUDS[object.player_id] === true;
}

/**
 * @returns whether provided object has linked story id.
 */
export function isStoryObject(object: XR_cse_alife_object): boolean {
  return getObjectStoryId(object.id) !== null;
}

/**
 * @returns whether surge can be started on provided level.
 */
export function isSurgeEnabledOnLevel(levelName: TLevel): boolean {
  return surgeConfig.SURGE_DISABLED_LEVELS[levelName] !== true;
}

/**
 * @returns whether object can be looted by stalkers from corpses.
 */
export function isLootableItem(object: XR_game_object): boolean {
  return lootable_table[object.section<TLootableItem>()] !== null;
}

/**
 * @returns whether object is ammo-defined section item.
 */
export function isAmmoItem(object: XR_game_object): boolean {
  return ammo[object.section<TAmmoItem>()] !== null;
}

/**
 * @returns whether section is ammo-defined.
 */
export function isAmmoSection(section: TSection): section is TAmmoItem {
  return ammo[section as TAmmoItem] !== null;
}

/**
 * @returns whether object is excluded from loot drop.
 */
export function isExcludedFromLootDropItem(object: XR_game_object): boolean {
  return lootable_table_exclude[object.section<TLootableExcludeItem>()] !== null;
}

/**
 * @returns whether current game level is changing.
 */
export function isLevelChanging(): boolean {
  const simulator: Optional<XR_alife_simulator> = alife();

  return simulator === null
    ? false
    : game_graph().vertex(simulator.actor().m_game_vertex_id).level_id() !== simulator?.level_id();
}

/**
 * @returns whether object is inside another object.
 */
export function isObjectInZone(object: Optional<XR_game_object>, zone: Optional<XR_game_object>): boolean {
  return object !== null && zone !== null && zone.inside(object.position());
}

/**
 * @returns whether object is wounded.
 */
export function isObjectWounded(object: XR_game_object): boolean {
  const state = storage.get(object.id());

  if (state === null) {
    return false;
  } else if (state.wounded !== null) {
    return tostring(state.wounded!.wound_manager.wound_state) !== "nil";
  } else {
    return false;
  }
}

/**
 * @returns whether object is meeting with someone.
 */
export function isObjectMeeting(object: XR_game_object): boolean {
  const actionPlanner: XR_action_planner = object.motivation_action_manager();

  if (actionPlanner !== null && actionPlanner.initialized()) {
    // todo: Hardcoded constant.
    if (actionPlanner.current_action_id() === action_ids.stohe_meet_base + 1) {
      return true;
    }
  }

  return false;
}

/**
 * @returns whether object is heavily wounded.
 */
export function isHeavilyWounded(npcId: number): boolean {
  const state: Optional<IStoredObject> = storage.get(npcId);

  return state.wounded !== null && tostring(state.wounded!.wound_manager.wound_state) !== "nil";
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isNpcInZone(object: Optional<XR_game_object>, zone: Optional<XR_game_object>): boolean {
  return object !== null && zone !== null && zone.inside(object.position());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActorInZone(zone: Optional<XR_game_object>): boolean {
  const actor: Optional<XR_game_object> = getActor();

  return actor !== null && zone !== null && zone.inside(actor.position());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActorInZoneWithName(zoneName: string, actor: Optional<XR_game_object> = getActor()): boolean {
  const zone: Optional<XR_game_object> = zoneByName.get(zoneName);

  return actor !== null && zone !== null && zone.inside(actor.position());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActiveSection(object: XR_game_object, section: Maybe<TSection>): boolean {
  if (!section) {
    abort("Object %s '%s': section is null", object.name(), section);
  }

  return section === storage.get(object.id()).active_section;
}

/**
 * @returns whether provided enemy object is actor.
 */
export function isActorEnemy(object: XR_game_object): boolean {
  return object.id() === getActor()!.id();
}

/**
 * @returns whether actor is alive.
 */
export function isActorAlive(): boolean {
  return getActor()?.alive() === true;
}

/**
 * @returns whether actor see the object.
 */
export function isSeenByActor(object: XR_game_object): boolean {
  return getActor()!.see(object);
}

/**
 * @returns whether distance between objects greater or equal.
 */
export function isDistanceBetweenObjectsGreaterOrEqual(
  first: XR_game_object,
  second: XR_game_object,
  distance: number
): boolean {
  return first.position().distance_to_sqr(second.position()) >= distance * distance;
}

/**
 * @returns whether distance between objects less or equal.
 */
export function isDistanceBetweenObjectsLessOrEqual(
  first: XR_game_object,
  second: XR_game_object,
  distance: number
): boolean {
  return first.position().distance_to_sqr(second.position()) <= distance * distance;
}

/**
 * @returns whether distance to actor greater or equal.
 */
export function isDistanceToActorGreaterOrEqual(object: XR_game_object, distance: number): boolean {
  return object.position().distance_to_sqr(getActor()!.position()) >= distance * distance;
}

/**
 * @returns whether distance to actor less or equal.
 */
export function isDistanceToActorLessOrEqual(object: XR_game_object, distance: number): boolean {
  return object.position().distance_to_sqr(getActor()!.position()) <= distance * distance;
}

/**
 * @returns whether currently black screen is visible and rendering is paused.
 */
export function isBlackScreen(): boolean {
  return device().precache_frame > 1;
}

/**
 * @returns whether currently sound is playing.
 */
export function isPlayingSound(object: XR_game_object): boolean {
  return GlobalSound.sound_table.has(object.id());
}
