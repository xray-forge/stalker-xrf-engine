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
  XR_cse_abstract,
  XR_cse_alife_object,
  game_graph,
  XR_vector
} from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { AnyArgs, AnyCallablesModule, Maybe, Optional } from "@/mod/lib/types";
import { isStalker } from "@/mod/scripts/core/checkers";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { getStoryObjectsRegistry } from "@/mod/scripts/core/StoryObjectsRegistry";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { get_infos_from_data, getConfigBoolean, getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { graphDistance } from "@/mod/scripts/utils/physics";
import { wait } from "@/mod/scripts/utils/time";

const log: LuaLogger = new LuaLogger("utils/alife");

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
export function getObjectSquad(object: Optional<XR_game_object | XR_cse_alife_creature_abstract>): Optional<ISimSquad> {
  if (object === null) {
    return abort("Attempt to get squad object from NIL.") as never;
  }

  const objectId: number =
    type(object.id) == "function" ? (object as XR_game_object).id() : (object as XR_cse_alife_creature_abstract).id;
  const se_obj: Optional<any> = alife().object(objectId);

  if (se_obj && se_obj.group_id !== MAX_UNSIGNED_16_BIT) {
    return alife().object<ISimSquad>(se_obj.group_id);
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
  position: XR_vector,
  lvi: number,
  gvi: number,
  target_id: number,
  num: number
): LuaTable<number, XR_cse_abstract> {
  const ini: XR_ini_file = system_ini();

  const num_in_box = ini.r_u32(section, "box_size");
  const container: LuaTable<number, XR_cse_abstract> = new LuaTable();

  while (num > num_in_box) {
    const obj = alife().create_ammo(section, position, lvi, gvi, target_id, num_in_box);

    table.insert(container, obj);

    num = num - num_in_box;
  }

  const obj = alife().create_ammo(section, position, lvi, gvi, target_id, num);

  table.insert(container, obj);

  return container;
}

/**
 * todo;
 */
export function createGenericItem(
  section: string,
  position: XR_vector,
  lvi: number,
  gvi: number,
  target_id: number,
  count: number,
  probability: number
): LuaTable<number, XR_cse_abstract> {
  const container: LuaTable<number, XR_cse_abstract> = new LuaTable();

  for (const i of $range(1, count)) {
    if (math.random(100) <= probability) {
      alife().create(section, position, lvi, gvi, target_id);
    }
  }

  return container;
}

/**
 * Set item condition.
 *
 * @param item
 * @param condition - value from 0 to 100, percents
 */
export function setItemCondition(item: XR_game_object, condition: number): void {
  item.set_condition(condition / 100);
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

/**
 * todo;
 */
export function getAlifeDistanceBetween(first: XR_cse_alife_object, second: XR_cse_alife_object): number {
  return graphDistance(first.m_game_vertex_id, second.m_game_vertex_id);
}

/**
 * todo;
 */
export function areOnSameAlifeLevel(first: XR_cse_alife_object, second: XR_cse_alife_object): boolean {
  return (
    game_graph().vertex(first.m_game_vertex_id).level_id() == game_graph().vertex(second.m_game_vertex_id).level_id()
  );
}

/**
 * todo;
 */
export function set_npc_info(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
  const in_info = get_infos_from_data(npc, getConfigString(ini, section, "in", npc, false, ""));
  const out_info = get_infos_from_data(npc, getConfigString(ini, section, "out", npc, false, ""));

  for (const [k, v] of in_info) {
    npc.give_info_portion(v);
  }

  for (const [k, v] of out_info) {
    npc.disable_info_portion(v);
  }
}

/**
 * todo: rename, update
 */
export function reset_group(npc: XR_game_object, ini: XR_ini_file, section: string): void {
  const group = getConfigNumber(ini, section, "group", npc, false, -1);

  if (group !== -1) {
    npc.change_team(npc.team(), npc.squad(), group);
  }
}

/**
 * todo: rename, update
 */
export function take_items_enabled(npc: XR_game_object, scheme: string, st: IStoredObject, section: string): void {
  const take_items = st.ini!.line_exist(section, "take_items")
    ? getConfigBoolean(st.ini!, section, "take_items", npc, false, true)
    : getConfigBoolean(st.ini!, st.section_logic!, "take_items", npc, false, true);

  npc.take_items_enabled(take_items);
}

/**
 * todo: rename, update
 */
export function can_select_weapon(npc: XR_game_object, scheme: string, st: IStoredObject, section: string): void {
  let str = getConfigString(st.ini!, section, "can_select_weapon", npc, false, "", "");

  if (str === "") {
    str = getConfigString(st.ini!, st.section_logic!, "can_select_weapon", npc, false, "", "true");
  }

  const cond = get_global<AnyCallablesModule>("xr_logic").parse_condlist(npc, section, "can_select_weapon", str);
  const can = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), npc, cond);

  npc.can_select_weapon(can == "true");
}

/**
 * todo;
 */
export function is_need_invulnerability(npc: XR_game_object): boolean {
  const npc_st = storage.get(npc.id());
  const invulnerability: Optional<string> = getConfigString(
    npc_st.ini!,
    npc_st.active_section!,
    "invulnerable",
    npc,
    false,
    "",
    null
  );

  if (invulnerability === null) {
    return false;
  }

  const invulnerability_condlist = get_global<AnyCallablesModule>("xr_logic").parse_condlist(
    npc,
    "invulnerability",
    "invulnerability",
    invulnerability
  );

  return (
    get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), npc, invulnerability_condlist) ===
    "true"
  );
}

/**
 * todo;
 */
export function reset_invulnerability(npc: XR_game_object, ini: XR_ini_file, section: string): void {
  const invulnerability = is_need_invulnerability(npc);

  if (npc.invulnerable() !== invulnerability) {
    npc.invulnerable(invulnerability);
  }
}

/**
 * todo;
 */
export function disable_invulnerability(npc: XR_game_object): void {
  npc.invulnerable(false);
}

/**
 * todo;
 */
export function update_invulnerability(npc: XR_game_object): void {
  const invulnerability = is_need_invulnerability(npc);

  if (npc.invulnerable() !== invulnerability) {
    npc.invulnerable(invulnerability);
  }
}

/**
 * todo
 */
export function reset_threshold(
  npc: XR_game_object,
  scheme: Optional<string>,
  st: IStoredObject,
  section: string
): void {
  const threshold_section: Optional<string> =
    scheme === null || scheme === "nil"
      ? getConfigString(st.ini!, st.section_logic!, "threshold", npc, false, "")
      : getConfigString(st.ini!, section, "threshold", npc, false, "");

  if (threshold_section !== null) {
    const max_ignore_distance = getConfigNumber(st.ini!, threshold_section, "max_ignore_distance", npc, false);

    if (max_ignore_distance !== null) {
      npc.max_ignore_monster_distance(max_ignore_distance);
    } else {
      npc.restore_max_ignore_monster_distance();
    }

    const ignore_monster: number = getConfigNumber(st.ini!, threshold_section, "ignore_monster", npc, false);

    if (ignore_monster !== null) {
      npc.ignore_monster_threshold(ignore_monster);
    } else {
      npc.restore_ignore_monster_threshold();
    }
  }
}
