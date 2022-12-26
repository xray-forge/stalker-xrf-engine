import { Maybe, Optional } from "@/mod/lib/types";
import { abort } from "@/mod/scripts/utils/debug";
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
export function levelObjectBySid(sid: number): Optional<XR_game_object> {
  const se_obj: Optional<XR_cse_alife_creature_abstract> = alife()?.story_object(sid);

  return se_obj === null ? null : level.object_by_id(se_obj.id);
}

/**
 * todo;
 */
export function getObjectStoryId(objectId: number): Optional<number> {
  return get_global("story_objects").get_story_objects_registry().get_story_id(objectId);
}

/**
 * todo: description
 */
export function getStoryObjectId(storyObjectId: string): Optional<number> {
  return get_global("story_objects").get_story_objects_registry().id_by_story_id[storyObjectId];
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
 * todo;
 */
export function getIdBySid(sid: number): Optional<number> {
  return alife()?.story_object(sid)?.id;
}

/**
 * function reset_action (npc, script_name)
 *  if npc:get_script () then
 *    npc:script (false, script_name)
 *  end
 *  npc:script (true, script_name)
 * end
 */
export function resetAction(npc: XR_game_object, scriptName: string): void {
  if (npc.get_script()) {
    npc.script(false, scriptName);
  }

  npc.script(true, scriptName);
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
 * function interrupt_action(who, script_name)
 *  if who:get_script() then
 *    who:script(false, script_name)
 *  end
 * end
 */
export function interruptAction(target: XR_game_object, scriptName: string): void {
  if (target.get_script()) {
    target.script(false, scriptName);
  }
}

/**
 * todo;
 */
export function getClsId(npc: XR_game_object): TXR_ClsId {
  return npc.clsid();
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
