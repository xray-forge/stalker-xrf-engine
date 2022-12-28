import {
  XR_game_object,
  level,
  XR_cse_alife_creature_abstract,
  alife,
  XR_ini_file,
  system_ini,
  game,
  XR_entity_action,
  entity_action,
  XR_cse_alife_human_abstract,
  XR_cse_abstract
} from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { AnyArgs, Maybe, Optional } from "@/mod/lib/types";
import { isStalker } from "@/mod/scripts/core/checkers";
import { storage } from "@/mod/scripts/core/db";
import { getStoryObjectsRegistry } from "@/mod/scripts/core/StoryObjectsRegistry";
import { abort } from "@/mod/scripts/utils/debug";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { wait } from "@/mod/scripts/utils/time";

const log: LuaLogger = new LuaLogger("utils/alife");
const MAX_16_BIT_VALUE: number = 65535;

/**
 * todo;
 */
export function addStoryObject(objectId: number, storyObjectId: string): void {
  getStoryObjectsRegistry().register(objectId, storyObjectId);
}

/**
 * todo;
 */
export function getStoryObject(storyObjectId: string): Optional<XR_game_object> {
  const objectId: Optional<number> = getStoryObjectsRegistry().get(storyObjectId);
  const possibleObject: Maybe<XR_game_object> = objectId ? storage.get(objectId)?.object : null;

  if (possibleObject) {
    return possibleObject;
  } else if (level && objectId) {
    return level.object_by_id(objectId);
  }

  return null;
}

/**
 * todo;
 */
export function unregisterStoryObjectById(id: number): void {
  getStoryObjectsRegistry().unregister_by_id(id);
}

/**
 * todo;
 */
export function unregisterStoryId(id: string): void {
  getStoryObjectsRegistry().unregister_by_story_id(id);
}

/**
 * todo;
 */
export function getObjectSquad(
  object: Optional<XR_game_object | XR_cse_alife_creature_abstract>
): Optional<XR_cse_alife_creature_abstract> {
  if (object === null) {
    return abort("Attempt to get squad object from NIL.") as never;
  }

  const objectId: number =
    type(object.id) == "function" ? (object as XR_game_object).id() : (object as XR_cse_alife_creature_abstract).id;
  const se_obj: Optional<any> = alife().object(objectId);

  if (se_obj && se_obj.group_id !== MAX_16_BIT_VALUE) {
    return alife().object(se_obj.group_id) as XR_cse_alife_creature_abstract;
  }

  return null;
}

/**
 * todo;
 */
export function getStorySquad(storyId: string): Optional<XR_cse_alife_creature_abstract> {
  const squadId: Optional<number> = getStoryObjectId(storyId);

  return squadId ? (alife().object(squadId) as XR_cse_alife_creature_abstract) : null;
}

/**
 * todo;
 */
export function createAmmo(
  section: string,
  position: any,
  lvi: any,
  gvi: any,
  pid: any,
  num: number
): LuaTable<number, XR_cse_abstract> {
  const ini: XR_ini_file = system_ini();

  const num_in_box = ini.r_u32(section, "box_size");
  const t: LuaTable<number, XR_cse_abstract> = new LuaTable();

  while (num > num_in_box) {
    const obj = alife().create_ammo(section, position, lvi, gvi, pid, num_in_box);

    table.insert(t, obj);

    num = num - num_in_box;
  }

  const obj = alife().create_ammo(section, position, lvi, gvi, pid, num);

  table.insert(t, obj);

  return t;
}

/**
 * -- ��������� �� ������ � �������.
 * function is_object_online(obj_id)
 *  return level.object_by_id(obj_id) ~= nil
 * end
 */
export function isObjectOnline(objectId: number): boolean {
  return level.object_by_id(objectId) !== null;
}

/**
 * todo;
 */
export function setCurrentTime(hour: number, min: number, sec: number) {
  const current_time_factor = level.get_time_factor();
  const current_time = game.time();

  let c_day = math.floor(current_time / 86400000);
  const c_time = current_time - c_day * 86400000;
  let n_time = (sec + min * 60 + hour * 3600) * 1000;

  if (c_time > n_time) {
    c_day = c_day + 1;
  }

  n_time = n_time + c_day * 86400000;

  level.set_time_factor(10000);

  while (game.time() < n_time) {
    wait();
  }

  level.set_time_factor(current_time_factor);
}

/**
 * todo;
 */
export function stopPlaySound(object: XR_game_object): void {
  if (object.alive()) {
    object.set_sound_mask(-1);
    object.set_sound_mask(0);
  }
}

/**
 * todo;
 */
export function changeTeamSquadGroup(
  serverObject: XR_cse_alife_creature_abstract,
  team: number,
  squad: number,
  group: number
): void {
  const clientObject: Maybe<XR_game_object> = storage.get(serverObject.id) && storage.get(serverObject.id).object;

  if (clientObject) {
    clientObject.change_team(team, squad, group);
  } else {
    serverObject.team = team;
    serverObject.squad = squad;
    serverObject.group = group;
  }
}

export function action(obj: Optional<XR_game_object>, ...args: AnyArgs): XR_entity_action {
  const act: XR_entity_action = new entity_action();
  let i: number = 0;

  while (args[i] !== null) {
    act.set_action(args[i]);
    i = i + 1;
  }

  if (obj !== null) {
    obj.command(act, false);
  }

  return new entity_action(act);
}

export function actionFirst(obj: Optional<XR_game_object>, ...args: AnyArgs): XR_entity_action {
  const act: XR_entity_action = new entity_action();
  let i: number = 0;

  while (args[i] !== null) {
    act.set_action(args[i]);
    i = i + 1;
  }

  if (obj !== null) {
    obj.command(act, true);
  }

  return new entity_action(act);
}

/**
 * todo;
 */
export function resetAction(npc: XR_game_object, scriptName: string): void {
  if (npc.get_script()) {
    npc.script(false, scriptName);
  }

  npc.script(true, scriptName);
}

/**
 * todo;
 */
export function interruptAction(npc: XR_game_object, scriptName: string): void {
  if (npc.get_script()) {
    npc.script(false, scriptName);
  }
}

/**
 * todo;
 */
export function getObjectCommunity(object: XR_game_object | XR_cse_alife_creature_abstract) {
  if (type(object.id) == "function") {
    return getCharacterCommunity(object as XR_game_object);
  } else {
    getAlifeCharacterCommunity(object as XR_cse_alife_human_abstract);
  }
}

/**
 * todo;
 */
export function getCharacterCommunity(object: XR_game_object): TCommunity {
  if (isStalker(object)) {
    return object.character_community() as TCommunity;
  }

  return communities.monster;
}

/**
 * todo;
 */
export function getAlifeCharacterCommunity(object: XR_cse_alife_human_abstract): TCommunity {
  if (isStalker(object, object.clsid())) {
    return object.community() as TCommunity;
  }

  return communities.monster;
}
