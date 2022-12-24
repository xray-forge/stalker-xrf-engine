import { Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/alife");

/**
 * -- ������ team:squad:group �������.
 * function change_team_squad_group(se_obj, team, squad, group)
 *  local cl_obj = db.storage[se_obj.id] and db.storage[se_obj.id].object
 *  if cl_obj ~= nil then
 *    cl_obj:change_team(team, squad, group)
 *  else
 *    se_obj.team = team
 *    se_obj.squad = squad
 *    se_obj.group = group
 *  end
 *  --printf("_G:TSG: [%s][%s][%s]", tostring(se_obj.team), tostring(se_obj.squad), tostring(se_obj.group))
 * end
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

/**
 * --     Story_ID -------------------------------------------------------------
 * function add_story_object(obj_id , story_obj_id)
 *  story_objects.get_story_objects_registry():register(obj_id , story_obj_id)
 * end
 */
export function addStoryObject(objectId: unknown, storyObjectId: string): void {
  get_global("story_objects").get_story_objects_registry().register(objectId, storyObjectId);
}

/**
 * function get_story_object(story_obj_id)
 *  local obj_id = story_objects.get_story_objects_registry():get(story_obj_id)
 *  if obj_id == nil then return nil end
 *  return (db.storage[obj_id] and db.storage[obj_id].object) or (level ~= nil and level.object_by_id(obj_id))
 * end
 */
export function getStoryObject(storyObjectId: unknown): unknown {
  const objectId = get_global("story_objects").get_story_objects_registry().get(storyObjectId);

  if (objectId === null) {
    return null;
  }

  return (db.storage[objectId] && db.storage[objectId].object) || (level !== null && level.object_by_id(objectId));
}

/**
 * -- �������� ���������� �� �����_����.
 * function level_object_by_sid( sid )
 *  local sim = alife()
 *
 *  if sim then
 *    local se_obj = sim:story_object( sid )
 *    if se_obj then
 *      return level.object_by_id( se_obj.id )
 *    end
 *  end
 *
 *  return nil
 * end
 */
export function levelObjectBySid(sid: number): Optional<XR_game_object> {
  const sim = alife();

  if (sim !== null) {
    const se_obj = sim.story_object(sid) as any;

    if (se_obj) {
      return level.object_by_id(se_obj.id);
    }
  }

  return null;
}

/**
 * function get_object_story_id(obj_id)
 *  return story_objects.get_story_objects_registry():get_story_id(obj_id)
 * end
 */
export function getObjectStoryId(objectId: unknown): Optional<unknown> {
  return get_global("story_objects").get_story_objects_registry().get_story_id(objectId);
}

/**
 * function get_story_object_id(story_obj_id)
 *  return story_objects.get_story_objects_registry().id_by_story_id[story_obj_id]
 * end
 */
export function getStoryObjectId(storyObjectId: unknown): Optional<unknown> {
  return get_global("story_objects").get_story_objects_registry().id_by_story_id[storyObjectId as string | number];
}

/**
 * function unregister_story_object_by_id(obj_id)
 *  story_objects.get_story_objects_registry():unregister_by_id(obj_id)
 * end
 */
export function unregisterStoryObjectById(id: unknown): void {
  get_global("story_objects").get_story_objects_registry().unregister_by_id(id);
}

/**
 * function unregister_story_id(story_id)
 *  story_objects.get_story_objects_registry():unregister_by_story_id(story_id)
 * end
 */
export function unregisterStoryId(id: unknown): void {
  get_global("story_objects").get_story_objects_registry().unregister_by_story_id(id);
}

/**
 * function get_object_squad(object)
 *  if object == nil then abort("You are trying to get squad_object from NIL object!!!") end
 *  local obj_id = nil
 *  if type(object.id) == "function" then
 *    obj_id = object:id()
 *  else
 *    obj_id = object.id
 *  end
 *  local se_obj = alife():object(obj_id)
 *  if se_obj and se_obj.group_id ~= 65535 then
 *    return alife():object(se_obj.group_id)
 *  end
 *  return nil
 * end
 */
export function getObjectSquad(object: Optional<any>): unknown {
  if (object === null) {
    abort("Attempt to get squad object from NIL.");
  }

  let obj_id = null;

  if (type(object.id) == "function") {
    obj_id = object.id();
  } else {
    obj_id = object.id;
  }

  const se_obj: any = alife().object(obj_id);

  if (se_obj && se_obj.group_id !== 65535) {
    return alife().object(se_obj.group_id);
  }

  return null;
}

/**
 * function get_story_squad(story_id)
 *  local squad_id = get_story_object_id(story_id)
 *  return squad_id and alife():object(squad_id)
 * end
 */
export function getStorySquad(id: unknown): unknown {
  const squadId: any = getStoryObjectId(id);

  return squadId && alife().object(squadId);
}

/**
 * -- �������� �������� ������� �� ����� ����.
 * function id_by_sid( sid )
 *  local sim = alife()
 *  if sim then
 *    local se_obj = sim:story_object( sid )
 *    if se_obj then
 *      return se_obj.id
 *    end
 *  end
 *  return nil
 * end
 */
export function idBySid(sid: number): Optional<unknown> {
  const sim: XR_alife_simulator = alife();

  if (sim !== null) {
    const se_obj: any = sim.story_object(sid);

    if (se_obj) {
      return se_obj.id;
    }
  }

  return null;
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
 *
 * function wait_game(time_to_wait)
 *  verify_if_thread_is_running()
 *
 *  if (time_to_wait == nil) then
 *    coroutine.yield()
 *  else
 *    local time_to_stop = game.time() + time_to_wait
 *    while game.time() <= time_to_stop do
 *      coroutine.yield()
 *    end
 *  end
 * end
 */
export function waitGame(timeToWait: Optional<number> = null): void {
  verify_if_thread_is_running();

  if (timeToWait === null) {
    coroutine.yield();
  } else {
    const time_to_stop = game.time() + timeToWait;

    while (game.time() <= time_to_stop) {
      coroutine.yield();
    }
  }
}

/**
 * function wait(time_to_wait)
 *  verify_if_thread_is_running()
 *
 *  if (time_to_wait == nil) then
 *    coroutine.yield()
 *  else
 *    local time_to_stop = time_global() + time_to_wait
 *    while time_global() <= time_to_stop do
 *      coroutine.yield()
 *    end
 *  end
 * end
 */
export function wait(timeToWait: Optional<number> = null): void {
  verify_if_thread_is_running();

  if (timeToWait === null) {
    coroutine.yield();
  } else {
    const time_to_stop = time_global() + timeToWait;

    while (time_global() <= time_to_stop) {
      coroutine.yield();
    }
  }
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
 * function get_clsid(npc)
 *  if npc == nil then return nil end
 *  return npc:clsid()
 * end
 */
export function getClsId(npc: Optional<XR_game_object>): Optional<string> {
  return npc ? npc.clsid() : null;
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
 *
 * function set_current_time (hour, min, sec)
 *  local current_time_factor = level.get_time_factor ()
 *  printf ("Need time : %d:%d:%d", hour, min, sec)
 *  local current_time = game.time ()
 *  local c_day = math.floor (current_time / 86400000)
 *  local c_time = current_time - c_day * 86400000
 *  local n_time = (sec + min * 60 + hour * 3600) * 1000
 *
 *  if c_time > n_time then c_day = c_day + 1 end
 *
 *  n_time = n_time + c_day * 86400000
 *  level.set_time_factor (10000)
 *  while game.time () < n_time do wait () end
 *  level.set_time_factor (current_time_factor)
 * end
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
 * function stop_play_sound(obj)
 *  if obj:alive() == true then
 *    obj:set_sound_mask(-1)
 *    obj:set_sound_mask(0)
 *  end
 * end
 */
export function stopPlaySound(object: XR_game_object): void {
  if (object.alive()) {
    object.set_sound_mask(-1);
    object.set_sound_mask(0);
  }
}
