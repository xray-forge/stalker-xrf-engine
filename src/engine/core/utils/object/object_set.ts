import { registry } from "@/engine/core/database";
import { getSectionsFromConditionLists, readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { isObjectInvulnerabilityNeeded } from "@/engine/core/utils/object/object_check";
import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import {
  ClientObject,
  IniFile,
  LuaArray,
  Optional,
  ServerCreatureObject,
  TNumberId,
  TRate,
  TSection,
} from "@/engine/lib/types";

/**
 * Set item condition.
 *
 * @param object - client object to change condition
 * @param condition - value from 0 to 100, percents
 */
export function setItemCondition(object: ClientObject, condition: TRate): void {
  object.set_condition(condition / 100);
}

/**
 * todo;
 */
export function disableObjectInvulnerability(object: ClientObject): void {
  object.invulnerable(false);
}

/**
 * todo;
 */
export function updateObjectInvulnerability(object: ClientObject): void {
  const isInvulnerabilityNeeded: boolean = isObjectInvulnerabilityNeeded(object);

  if (object.invulnerable() !== isInvulnerabilityNeeded) {
    object.invulnerable(isInvulnerabilityNeeded);
  }
}

/**
 * todo;
 */
export function resetObjectInvulnerability(object: ClientObject): void {
  const nextInvulnerabilityState: boolean = isObjectInvulnerabilityNeeded(object);

  if (object.invulnerable() !== nextInvulnerabilityState) {
    object.invulnerable(nextInvulnerabilityState);
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
  serverObject: ServerCreatureObject,
  teamId: TNumberId,
  squadId: TNumberId,
  groupId: TNumberId
): void {
  const clientObject: Optional<ClientObject> = registry.objects.get(serverObject.id)?.object;

  if (clientObject === null) {
    serverObject.team = teamId;
    serverObject.squad = squadId;
    serverObject.group = groupId;
  } else {
    clientObject.change_team(teamId, squadId, groupId);
  }
}

/**
 * todo: rename, update
 */
export function resetObjectGroup(object: ClientObject, ini: IniFile, section: TSection): void {
  const group: TNumberId = readIniNumber(ini, section, "group", false, -1);

  if (group !== -1) {
    object.change_team(object.team(), object.squad(), group);
  }
}

/**
 * todo;
 */
export function setObjectInfo(object: ClientObject, ini: IniFile, section: TSection): void {
  const inInfosList: LuaArray<TInfoPortion> = getSectionsFromConditionLists(
    object,
    readIniString(ini, section, "in", false, "")
  );
  const outInfosList: LuaArray<TInfoPortion> = getSectionsFromConditionLists(
    object,
    readIniString(ini, section, "out", false, "")
  );

  for (const [, infoPortion] of inInfosList) {
    object.give_info_portion(infoPortion);
  }

  for (const [, infoPortion] of outInfosList) {
    object.disable_info_portion(infoPortion);
  }
}
