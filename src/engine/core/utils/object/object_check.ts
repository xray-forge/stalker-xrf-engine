import { alife, clsid, level, stalker_ids, system_ini } from "xray16";

import {
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  IRegistryObjectState,
  registry,
} from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import { assertDefined } from "@/engine/core/utils/assertion";
import { parseConditionsList, pickSectionFromCondList, readIniString } from "@/engine/core/utils/ini";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { squadMonsters } from "@/engine/lib/constants/behaviours";
import { artefactClassIds, monsterClassIds, stalkerClassIds, weaponClassIds } from "@/engine/lib/constants/class_ids";
import { TCommunity } from "@/engine/lib/constants/communities";
import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import {
  lootableTable,
  lootableTableExclude,
  TLootableExcludeItem,
  TLootableItem,
} from "@/engine/lib/constants/items/lootable_table";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { TRUE } from "@/engine/lib/constants/words";
import {
  ActionPlanner,
  AnyGameObject,
  ClientObject,
  Maybe,
  Optional,
  ServerArtefactItemObject,
  ServerHumanObject,
  ServerMonsterAbstractObject,
  ServerObject,
  TClassId,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";

/**
 * todo;
 */
export function isObjectInvulnerabilityNeeded(object: ClientObject): boolean {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const invulnerability: Optional<string> = readIniString(
    state.ini,
    state.activeSection,
    "invulnerable",
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
export function isObjectInCombat(object: ClientObject): boolean {
  const actionPlanner: ActionPlanner = object.motivation_action_manager();

  if (!actionPlanner.initialized()) {
    return false;
  }

  const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

  return (
    currentActionId === stalker_ids.action_combat_planner || currentActionId === stalker_ids.action_post_combat_wait
  );
}

/**
 * Is provided target stalker and alive.
 *
 * @param targetObject - client/server object or story ID to check
 * @returns whether target stalker object is alive
 */
export function isStalkerAlive(targetObject: ClientObject | ServerHumanObject | TStringId): boolean {
  let targetId: Optional<TNumberId> = null;

  if (type(targetObject) === "string") {
    targetId = getObjectIdByStoryId(targetObject as TStringId);
  } else if (type((targetObject as ServerHumanObject).id) === "number") {
    targetId = (targetObject as ServerHumanObject).id;
  } else {
    targetId = (targetObject as ClientObject).id();
  }

  if (targetId === null) {
    return false;
  } else {
    const object: Optional<ServerHumanObject> = alife().object(targetId);

    return object !== null && isStalker(object) && object.alive();
  }
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
 * todo: description
 */
export function isActorSeenByObject(object: ClientObject): boolean {
  return object.alive() && object.see(registry.actor);
}

/**
 * todo: description
 */
export function isObjectSeenByActor(object: ClientObject): boolean {
  return registry.actor.alive() && registry.actor.see(object);
}

/**
 * Check whether object is injured.
 *
 * @param object - target client object to check
 * @returns whether object is injured/bleeding/contaminated
 */
export function isObjectInjured(object: ClientObject): boolean {
  return object.health < 1 || object.radiation > 0 || object.bleeding > 0;
}

/**
 * todo;
 */
export function isMonster(object: AnyGameObject): object is ServerMonsterAbstractObject {
  return monsterClassIds[object.clsid()] === true;
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
export function isStalker(object: AnyGameObject): object is ServerHumanObject {
  return stalkerClassIds[object.clsid()] === true;
}

/**
 * todo;
 */
export function isStalkerClassId(classId: TNumberId): boolean {
  return classId === clsid.stalker || classId === clsid.script_stalker;
}

/**
 * todo;
 */
export function isWeapon(object: Optional<AnyGameObject>): boolean {
  if (object === null) {
    return false;
  }

  return weaponClassIds[object.clsid()] === true;
}

/**
 * todo;
 */
export function isGrenade(object: Optional<AnyGameObject>): boolean {
  if (object === null) {
    return false;
  }

  const id: TClassId = object.clsid();

  return id === clsid.wpn_grenade_rgd5_s || id === clsid.wpn_grenade_f1_s;
}

/**
 * Is provided object artefact.
 */
export function isArtefact(object: AnyGameObject): object is ServerArtefactItemObject {
  return artefactClassIds[object.clsid()] === true;
}

/**
 * todo;
 */
export function isStrappableWeapon(object: Optional<ClientObject>): object is ClientObject {
  return object === null ? false : system_ini().line_exist(object.section(), "strap_bone0");
}

/**
 * @returns whether level is fully indoor.
 */
export function isUndergroundLevel(level: TLevel): boolean {
  return level === levels.jupiter_underground || level === levels.labx8;
}

/**
 * @returns whether provided object has linked story id.
 */
export function isStoryObject(object: ServerObject): boolean {
  return getStoryIdByObjectId(object.id) !== null;
}

/**
 * @returns whether object can be looted by stalkers from corpses.
 */
export function isLootableItem(object: ClientObject): boolean {
  return object.section<TLootableItem>() in lootableTable;
}

/**
 * @returns whether object is ammo-defined section item.
 */
export function isAmmoItem(object: ClientObject): boolean {
  return object.section<TAmmoItem>() in ammo;
}

/**
 * @returns whether section is ammo-defined.
 */
export function isAmmoSection(section: TSection): section is TAmmoItem {
  return section in ammo;
}

/**
 * Check whether story object exists.
 *
 * @param storyId - story ID to check existing
 * @returns whether story object exists
 */
export function isStoryObjectExisting(storyId: TStringId): boolean {
  return getServerObjectByStoryId(storyId) !== null;
}

/**
 * @returns whether provided community squad is immune to surge.
 */
export function isImmuneToSurge(object: Squad): boolean {
  return surgeConfig.IMMUNE_SQUDS[object.faction] === true;
}

/**
 * @returns whether surge can be started on provided level.
 */
export function isSurgeEnabledOnLevel(levelName: TLevel): boolean {
  return surgeConfig.SURGE_DISABLED_LEVELS[levelName] !== true;
}

/**
 * @returns whether object is excluded from loot drop.
 */
export function isExcludedFromLootDropItem(object: ClientObject): boolean {
  return lootableTableExclude[object.section<TLootableExcludeItem>()] !== null;
}

/**
 * @returns whether currently sound is playing.
 */
export function isPlayingSound(object: ClientObject): boolean {
  return registry.sounds.generic.has(object.id());
}

/**
 * @param object - object to check
 * @param section - logic section to check
 * @returns whether object logics active section is same as provided
 */
export function isActiveSection(object: ClientObject, section: Maybe<TSection>): boolean {
  assertDefined(section, "'isActiveSection' error for '%s', no section defined: '%s'.", object.name(), section);

  return section === registry.objects.get(object.id()).activeSection;
}
