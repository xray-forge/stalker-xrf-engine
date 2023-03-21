import {
  alife,
  entity_action,
  game,
  game_graph,
  level,
  stalker_ids,
  TXR_entity_action,
  vector,
  XR_action_planner,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_cse_alife_online_offline_group,
  XR_entity_action,
  XR_game_object,
  XR_ini_file,
  XR_vector,
} from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/alife/Squad";
import { isCseAlifeObject, isStalker } from "@/engine/core/utils/check/is";
import { abort } from "@/engine/core/utils/debug";
import { getInfosFromData, pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { graphDistance } from "@/engine/core/utils/physics";
import { wait } from "@/engine/core/utils/time";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import {
  EScheme,
  LuaArray,
  Optional,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";
import { AnyGameObject } from "@/engine/lib/types/engine";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @param object - any game object used by the game engine.
 * @returns tuple of object position details: id, gvi, lvi, position.
 */
export function getObjectPositioning(
  object: AnyGameObject
): LuaMultiReturn<[TNumberId, TNumberId, TNumberId, XR_vector]> {
  if (isCseAlifeObject(object)) {
    return $multi(object.id, object.m_game_vertex_id, object.m_level_vertex_id, object.position);
  } else {
    return $multi(object.id(), object.game_vertex_id(), object.level_vertex_id(), object.position());
  }
}

/**
 * todo;
 */
export function getObjectSquad(object: Optional<XR_game_object | XR_cse_alife_creature_abstract>): Optional<Squad> {
  if (object === null) {
    return abort("Attempt to get squad object from NIL.");
  }

  const objectId: TNumberId =
    type(object.id) === "function" ? (object as XR_game_object).id() : (object as XR_cse_alife_creature_abstract).id;
  const serverObject: Optional<XR_cse_alife_creature_abstract> = alife().object(objectId);

  if (serverObject && serverObject.group_id !== MAX_U16) {
    return alife().object<Squad>(serverObject.group_id);
  }

  return null;
}

/**
 * Set item condition.
 *
 * @param object - client object to change condition
 * @param condition - value from 0 to 100, percents
 */
export function setItemCondition(object: XR_game_object, condition: TRate): void {
  object.set_condition(condition / 100);
}

/**
 * Check whether provided object ID is online.
 *
 * @param objectId - object identifier
 */
export function isObjectOnline(objectId: TNumberId): boolean {
  return level.object_by_id(objectId) !== null;
}

/**
 * Set current time in level.
 * Creates idle state with multiplied time factor.
 */
export function setCurrentTime(hour: number, min: number, sec: number): void {
  const currentTimeFactor: TRate = level.get_time_factor();
  const currentGameTime: TTimestamp = game.time();

  // todo: Magic constants.
  let currentDay: number = math.floor(currentGameTime / 86_400_000);
  const currentTime: number = currentGameTime - currentDay * 86_400_000;
  let newTime: number = (sec + min * 60 + hour * 3_600) * 1000;

  if (currentTime > newTime) {
    currentDay = currentDay + 1;
  }

  newTime = newTime + currentDay * 86_400_000;

  level.set_time_factor(10_000);

  while (game.time() < newTime) {
    wait();
  }

  level.set_time_factor(currentTimeFactor);
}

/**
 * todo;
 */
export function stopObjectPlayingSound(object: XR_game_object): void {
  if (object.alive()) {
    object.set_sound_mask(-1);
    object.set_sound_mask(0);
  }
}

/**
 * todo;
 * @param serverObject - alife server object to change team parameters
 * @param teamId - ?
 * @param squadId - id of the parent squad, bound to spawning smart
 * @param groupId - id of the level group
 *
 */
export function changeTeamSquadGroup(
  serverObject: XR_cse_alife_creature_abstract,
  teamId: TNumberId,
  squadId: TNumberId,
  groupId: TNumberId
): void {
  const clientObject: Optional<XR_game_object> = registry.objects.get(serverObject.id)?.object;

  if (clientObject === null) {
    serverObject.team = teamId;
    serverObject.squad = squadId;
    serverObject.group = groupId;
  } else {
    clientObject.change_team(teamId, squadId, groupId);
  }
}

/**
 * todo;
 */
export function action(object: Optional<XR_game_object>, ...actions: Array<TXR_entity_action>): XR_entity_action {
  const entityAction: XR_entity_action = new entity_action();
  let index: TIndex = 0;

  while (actions[index] !== null) {
    entityAction.set_action(actions[index]);
    index += 1;
  }

  if (object !== null) {
    object.command(entityAction, false);
  }

  // todo: Is copy needed?
  return new entity_action(entityAction);
}

/**
 * todo;
 */
export function resetObjectAction(object: XR_game_object, scriptName: TName): void {
  if (object.get_script()) {
    object.script(false, scriptName);
  }

  object.script(true, scriptName);
}

/**
 * todo;
 */
export function interruptObjectAction(object: XR_game_object, scriptName: TName): void {
  if (object.get_script()) {
    object.script(false, scriptName);
  }
}

/**
 * todo;
 */
export function getObjectCommunity(object: AnyGameObject): TCommunity {
  if (type(object.id) === "function") {
    return getCharacterCommunity(object as XR_game_object);
  } else {
    return getAlifeCharacterCommunity(object as XR_cse_alife_human_abstract);
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
export function getAlifeCharacterCommunity(
  object: XR_cse_alife_human_abstract | XR_cse_alife_online_offline_group
): TCommunity {
  if (isStalker(object, object.clsid())) {
    return object.community() as TCommunity;
  }

  return communities.monster;
}

/**
 * todo;
 */
export function getServerDistanceBetween(first: XR_cse_alife_object, second: XR_cse_alife_object): TDistance {
  return graphDistance(first.m_game_vertex_id, second.m_game_vertex_id);
}

/**
 * todo;
 */
export function areObjectsOnSameLevel(first: XR_cse_alife_object, second: XR_cse_alife_object): boolean {
  return (
    game_graph().vertex(first.m_game_vertex_id).level_id() === game_graph().vertex(second.m_game_vertex_id).level_id()
  );
}

/**
 * todo;
 */
export function setObjectInfo(object: XR_game_object, ini: XR_ini_file, section: TSection): void {
  const inInfosList: LuaArray<TInfoPortion> = getInfosFromData(
    object,
    getConfigString(ini, section, "in", object, false, "")
  );
  const outInfosList: LuaArray<TInfoPortion> = getInfosFromData(
    object,
    getConfigString(ini, section, "out", object, false, "")
  );

  for (const [index, infoPortion] of inInfosList) {
    object.give_info_portion(infoPortion);
  }

  for (const [index, infoPortion] of outInfosList) {
    object.disable_info_portion(infoPortion);
  }
}

/**
 * todo: rename, update
 */
export function resetObjectGroup(object: XR_game_object, ini: XR_ini_file, section: TSection): void {
  const group: TNumberId = getConfigNumber(ini, section, "group", object, false, -1);

  if (group !== -1) {
    object.change_team(object.team(), object.squad(), group);
  }
}

/**
 * todo: rename, update
 */
export function initializeObjectTakeItemsEnabledState(
  object: XR_game_object,
  scheme: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  const isTakeItemsEnabled: boolean = state.ini.line_exist(section, "take_items")
    ? getConfigBoolean(state.ini, section, "take_items", object, false, true)
    : getConfigBoolean(state.ini, state.section_logic, "take_items", object, false, true);

  object.take_items_enabled(isTakeItemsEnabled);
}

/**
 * todo: rename, update
 */
export function initializeObjectCanSelectWeaponState(
  object: XR_game_object,
  scheme: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  let data: string = getConfigString(state.ini, section, "can_select_weapon", object, false, "", "");

  if (data === "") {
    data = getConfigString(state.ini, state.section_logic, "can_select_weapon", object, false, "", TRUE);
  }

  const conditionsList: TConditionList = parseConditionsList(data);
  const canSelectSection: TSection = pickSectionFromCondList(registry.actor, object, conditionsList)!;

  object.can_select_weapon(canSelectSection === TRUE);
}

/**
 * todo;
 */
export function isObjectInvulnerabilityNeeded(object: XR_game_object): boolean {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const invulnerability: Optional<string> = getConfigString(
    state.ini,
    state.active_section,
    "invulnerable",
    object,
    false,
    "",
    null
  );

  if (invulnerability === null) {
    return false;
  }

  return pickSectionFromCondList(registry.actor, object, parseConditionsList(invulnerability)) === TRUE;
}

/**
 * todo;
 */
export function resetObjectInvulnerability(object: XR_game_object): void {
  const invulnerability = isObjectInvulnerabilityNeeded(object);

  if (object.invulnerable() !== invulnerability) {
    object.invulnerable(invulnerability);
  }
}

/**
 * todo;
 */
export function disableObjectInvulnerability(object: XR_game_object): void {
  object.invulnerable(false);
}

/**
 * todo;
 */
export function updateObjectInvulnerability(object: XR_game_object): void {
  const isInvulnerabilityNeeded: boolean = isObjectInvulnerabilityNeeded(object);

  if (object.invulnerable() !== isInvulnerabilityNeeded) {
    object.invulnerable(isInvulnerabilityNeeded);
  }
}

/**
 * todo
 */
export function resetObjectIgnoreThreshold(
  object: XR_game_object,
  scheme: Optional<EScheme>,
  state: IRegistryObjectState,
  section: TSection
): void {
  const thresholdSection: Optional<TSection> =
    scheme === null || scheme === NIL
      ? getConfigString(state.ini, state.section_logic, "threshold", object, false, "")
      : getConfigString(state.ini, section, "threshold", object, false, "");

  if (thresholdSection !== null) {
    const maxIgnoreDistance: Optional<TDistance> = getConfigNumber(
      state.ini,
      thresholdSection,
      "max_ignore_distance",
      object,
      false
    );

    if (maxIgnoreDistance === null) {
      object.restore_max_ignore_monster_distance();
    } else {
      object.max_ignore_monster_distance(maxIgnoreDistance);
    }

    const ignoreMonster: Optional<TNumberId> = getConfigNumber(
      state.ini,
      thresholdSection,
      "ignore_monster",
      object,
      false
    );

    if (ignoreMonster === null) {
      object.restore_ignore_monster_threshold();
    } else {
      object.ignore_monster_threshold(ignoreMonster);
    }
  }
}

/**
 * todo;
 */
export function isObjectInCombat(object: XR_game_object): boolean {
  const actionPlanner: XR_action_planner = object.motivation_action_manager();

  if (!actionPlanner.initialized()) {
    return false;
  }

  const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

  return (
    currentActionId === stalker_ids.action_combat_planner || currentActionId === stalker_ids.action_post_combat_wait
  );
}

/**
 * todo: description
 */
export function isActorSeenByObject(object: XR_game_object): boolean {
  return object.alive() && object.see(registry.actor);
}

/**
 * todo: description
 */
export function sendToNearestAccessibleVertex(object: XR_game_object, vertexId: TNumberId): TNumberId {
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
  params: [TName, Optional<TName>]
): LuaMultiReturn<[boolean, Optional<LuaArray<TName>>]> {
  const az_name = params && params[0];
  const af_name = params && params[1];
  const anomalyZone = registry.anomalies.get(az_name);

  if (anomalyZone === null) {
    return $multi(false, null);
  }

  if (anomalyZone.spawnedArtefactsCount < 1) {
    return $multi(false, null);
  }

  if (af_name === null) {
    const af_table: LuaArray<string> = new LuaTable();

    for (const [k, v] of registry.artefacts.ways) {
      const artefactObject: Optional<XR_cse_alife_object> = alife().object(tonumber(k)!);

      if (artefactObject) {
        table.insert(af_table, artefactObject.section_name());
      }
    }

    return $multi(true, af_table);
  }

  for (const [artefactId] of registry.artefacts.ways) {
    if (alife().object(tonumber(artefactId)!) && af_name === alife().object(tonumber(artefactId)!)!.section_name()) {
      return $multi(true, null);
    }
  }

  return $multi(false, null);
}

/**
 * todo;
 */
export function isObjectAsleep(object: XR_game_object): boolean {
  return registry.objects.get(object.id()).state_mgr!.animstate.states.current_state === "sleep";
}

/**
 * todo;
 * todo;
 * todo;
 */
export function scriptReleaseObject(object: XR_game_object, scriptName: TName = $filename): void {
  if (object.get_script()) {
    object.script(false, scriptName);
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
export function scriptCaptureObject(
  object: XR_game_object,
  resetActions: Optional<boolean>,
  scriptName: TName = $filename
): void {
  if (resetActions === null) {
    abort("mob_capture: reset_actions parameter's value is !specified");
  }

  if (resetActions !== null) {
    resetObjectAction(object, scriptName);
  } else {
    if (!object.get_script()) {
      object.script(true, scriptName);
    }
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isObjectScriptCaptured(object: XR_game_object): boolean {
  return object.get_script() !== null;
}
