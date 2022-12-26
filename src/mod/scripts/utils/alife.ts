import { communities, TCommunity } from "@/mod/globals/communities";
import { AnyArgs, Optional } from "@/mod/lib/types";
import { isStalker } from "@/mod/scripts/core/checkers";
import { abort } from "@/mod/scripts/utils/debug";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { wait } from "@/mod/scripts/utils/time";

const log: LuaLogger = new LuaLogger("utils/alife");
const MAX_16_BIT_VALUE: number = 65535;

/**
 * todo;
 */
export function addStoryObject(objectId: number, storyObjectId: number): void {
  get_global("story_objects").get_story_objects_registry().register(objectId, storyObjectId);
}

/**
 * todo;
 */
export function getStoryObject(storyObjectId: number): Optional<XR_cse_alife_creature_abstract> {
  const objectId: Optional<number> = get_global("story_objects").get_story_objects_registry().get(storyObjectId);

  return objectId
    ? (db.storage[objectId] && db.storage[objectId].object) || (level !== null && level.object_by_id(objectId))
    : null;
}

/**
 * todo;
 */
export function unregisterStoryObjectById(id: number): void {
  get_global("story_objects").get_story_objects_registry().unregister_by_id(id);
}

/**
 * todo;
 */
export function unregisterStoryId(id: number): void {
  get_global("story_objects").get_story_objects_registry().unregister_by_story_id(id);
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
    return alife().object(se_obj.group_id);
  }

  return null;
}

/**
 * todo;
 */
export function getStorySquad(storyId: string): Optional<XR_cse_alife_creature_abstract> {
  const squadId: Optional<number> = getStoryObjectId(storyId);

  return squadId ? alife().object(squadId) : null;
}

/**
 * function create_ammo(section, position, lvi, gvi, pid, num)
 *  local ini = system_ini()
 *
 *  local num_in_box = ini:r_u32(section, "box_size")
 *  local t = {}
 *
 *  while num > num_in_box do
 *    local obj = alife():create_ammo(section, position, lvi,  gvi, pid, num_in_box)
 *    table.insert(t, obj)
 *    num = num - num_in_box
 *  end
 *
 *  local obj = alife():create_ammo(section, position, lvi,  gvi, pid, num)
 *  table.insert(t, obj)
 *  return t
 * end
 */
export function createAmmo(section: string, position: any, lvi: any, gvi: any, pid: any, num: number): any {
  const ini: XR_ini_file = system_ini();

  const num_in_box = ini.r_u32(section, "box_size");
  const t = {};

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
export function changeTeamSquadGroup(se_obj: any, team: any, squad: any, group: any) {
  const cl_obj = db.storage[se_obj.id] && db.storage[se_obj.id].object;

  if (cl_obj !== null) {
    cl_obj.change_team(team, squad, group);
  } else {
    se_obj.team = team;
    se_obj.squad = squad;
    se_obj.group = group;
  }
}

export function action(obj: Optional<XR_game_object>, ...args: AnyArgs): XR_entity_action {
  log.info("Set action for:", obj?.name());

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
  log.info("Set action for:", obj?.name());

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
  log.info("Reset action:", npc.name(), scriptName);

  if (npc.get_script()) {
    npc.script(false, scriptName);
  }

  npc.script(true, scriptName);
}

/**
 * todo;
 */
export function interruptAction(npc: XR_game_object, scriptName: string): void {
  log.info("Interrupt action:", npc.name(), scriptName);

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
export function getAlifeCharacterCommunity(object: XR_cse_alife_creature_abstract): TCommunity {
  if (isStalker(object, object.clsid())) {
    return object.community() as TCommunity;
  }

  return communities.monster;
}
