import {
  alife,
  entity_action,
  game,
  game_graph,
  level,
  stalker_ids,
  vector,
  XR_action_planner,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_cse_alife_online_offline_group,
  XR_entity_action,
  XR_game_object,
  XR_ini_file,
} from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { AnyArgs, LuaArray, Maybe, Optional, TSection } from "@/mod/lib/types";
import { ISimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { ISimSquadReachTargetAction } from "@/mod/scripts/core/alife/SimSquadReachTargetAction";
import { ISimSquadStayOnTargetAction } from "@/mod/scripts/core/alife/SimSquadStayOnTargetAction";
import { anomalyByName, ARTEFACT_WAYS_BY_ARTEFACT_ID, getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { getStoryObjectsRegistry } from "@/mod/scripts/core/db/StoryObjectsRegistry";
import { spawnItemsForObject } from "@/mod/scripts/utils/alife_spawn";
import { isStalker } from "@/mod/scripts/utils/checkers/is";
import {
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  getInfosFromData,
  parseCondList,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { graphDistance } from "@/mod/scripts/utils/physics";
import { wait } from "@/mod/scripts/utils/time";

const logger: LuaLogger = new LuaLogger("alife");

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
    type(object.id) === "function" ? (object as XR_game_object).id() : (object as XR_cse_alife_creature_abstract).id;
  const se_obj: Optional<any> = alife().object(objectId);

  if (se_obj && se_obj.group_id !== MAX_UNSIGNED_16_BIT) {
    return alife().object<ISimSquad>(se_obj.group_id);
  }

  return null;
}

export function getObjectSquadAction(
  object: XR_game_object
): Optional<ISimSquadReachTargetAction | ISimSquadStayOnTargetAction> {
  const squad: Optional<ISimSquad> = getObjectSquad(object);

  return squad && squad.current_action;
}

/**
 * todo;
 */
export function getStorySquad<T extends XR_cse_alife_online_offline_group>(storyId: string): Optional<T> {
  const squadId: Optional<number> = getStoryObjectId(storyId);

  return squadId ? alife().object<T>(squadId) : null;
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
  if (type(object.id) === "function") {
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
    game_graph().vertex(first.m_game_vertex_id).level_id() === game_graph().vertex(second.m_game_vertex_id).level_id()
  );
}

/**
 * todo;
 */
export function setObjectInfo(object: XR_game_object, ini: XR_ini_file, section: TSection): void {
  const in_info = getInfosFromData(object, getConfigString(ini, section, "in", object, false, ""));
  const out_info = getInfosFromData(object, getConfigString(ini, section, "out", object, false, ""));

  for (const [k, v] of in_info) {
    object.give_info_portion(v);
  }

  for (const [k, v] of out_info) {
    object.disable_info_portion(v);
  }
}

/**
 * todo: rename, update
 */
export function resetObjectGroup(object: XR_game_object, ini: XR_ini_file, section: TSection): void {
  const group = getConfigNumber(ini, section, "group", object, false, -1);

  if (group !== -1) {
    object.change_team(object.team(), object.squad(), group);
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

  const cond = parseCondList(npc, section, "can_select_weapon", str);
  const can: TSection = pickSectionFromCondList(getActor() as XR_game_object, npc, cond)!;

  npc.can_select_weapon(can === "true");
}

/**
 * todo;
 */
export function isInvulnerabilityNeeded(object: XR_game_object): boolean {
  const npc_st = storage.get(object.id());
  const invulnerability: Optional<string> = getConfigString(
    npc_st.ini!,
    npc_st.active_section!,
    "invulnerable",
    object,
    false,
    "",
    null
  );

  if (invulnerability === null) {
    return false;
  }

  const invulnerability_condlist = parseCondList(object, "invulnerability", "invulnerability", invulnerability);

  return pickSectionFromCondList(getActor() as XR_game_object, object, invulnerability_condlist) === "true";
}

/**
 * todo;
 */
export function reset_invulnerability(npc: XR_game_object, ini: XR_ini_file, section: TSection): void {
  const invulnerability = isInvulnerabilityNeeded(npc);

  if (npc.invulnerable() !== invulnerability) {
    npc.invulnerable(invulnerability);
  }
}

/**
 * todo;
 */
export function disableInvulnerability(npc: XR_game_object): void {
  npc.invulnerable(false);
}

/**
 * todo;
 */
export function updateInvulnerability(ob: XR_game_object): void {
  const invulnerability = isInvulnerabilityNeeded(ob);

  if (ob.invulnerable() !== invulnerability) {
    ob.invulnerable(invulnerability);
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

/**
 * todo;
 */
export function isNpcInCombat(npc: XR_game_object): boolean {
  const actionPlanner: XR_action_planner = npc.motivation_action_manager();

  if (!actionPlanner.initialized()) {
    return false;
  }

  const current_action_id: number = actionPlanner.current_action_id();

  return (
    current_action_id === stalker_ids.action_combat_planner || current_action_id === stalker_ids.action_post_combat_wait
  );
}

/**
 * todo: description
 */
export function spawnDefaultNpcItems(npc: XR_game_object, state: IStoredObject): void {
  const items_to_spawn: LuaTable<string, number> = new LuaTable();
  const spawn_items_section = getConfigString(state.ini!, state.section_logic!, "spawn", npc, false, "", null);

  if (spawn_items_section === null) {
    return;
  }

  const n = state.ini!.line_count(spawn_items_section);

  for (const i of $range(0, n - 1)) {
    const [result, id, value] = state.ini!.r_line(spawn_items_section, i, "", "");

    items_to_spawn.set(id, value === "" ? 1 : tonumber(value)!);
  }

  for (const [k, v] of items_to_spawn) {
    if (npc.object(k) === null) {
      spawnItemsForObject(npc, k, v);
    }
  }
}

/**
 * todo: description
 */
export function isSeeingActor(object: XR_game_object): boolean {
  return object.alive() && object.see(getActor()!);
}

/**
 * todo: description
 */
export function sendToNearestAccessibleVertex(object: XR_game_object, vertexId: number): number {
  if (!object.accessible(vertexId)) {
    vertexId = object.accessible_nearest(level.vertex_position(vertexId), new vector());
  }

  object.set_dest_level_vertex_id(vertexId);

  return vertexId;
}

/**
 * todo;
 */
export function anomalyHasArtefact(
  actor: XR_game_object,
  npc: Optional<XR_game_object>,
  params: [string, Optional<string>]
): LuaMultiReturn<[boolean, Optional<LuaArray<string>>]> {
  const az_name = params && params[0];
  const af_name = params && params[1];
  const anomal_zone = anomalyByName.get(az_name);

  if (anomal_zone === null) {
    return $multi(false, null);
  }

  if (anomal_zone.spawned_count < 1) {
    return $multi(false, null);
  }

  if (af_name === null) {
    const af_table: LuaArray<string> = new LuaTable();

    for (const [k, v] of ARTEFACT_WAYS_BY_ARTEFACT_ID) {
      const artefactObject: Optional<XR_cse_alife_object> = alife().object(tonumber(k)!);

      if (artefactObject) {
        table.insert(af_table, artefactObject.section_name());
      }
    }

    return $multi(true, af_table);
  }

  for (const [k, v] of ARTEFACT_WAYS_BY_ARTEFACT_ID) {
    if (alife().object(tonumber(k)!) && af_name === alife().object(tonumber(k)!)!.section_name()) {
      return $multi(true, null);
    }
  }

  return $multi(false, null);
}
