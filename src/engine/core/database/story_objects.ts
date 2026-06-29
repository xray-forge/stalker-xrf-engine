import { level } from "xray16";

import { SYSTEM_INI } from "@/engine/core/database/ini_registry";
import { registry } from "@/engine/core/database/registry";
import { abort, assert } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini/ini_read";
import {
  AnyGameObject,
  GameObject,
  IniFile,
  Optional,
  ServerObject,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";

/**
 * Register story object link based on ini configuration.
 *
 * @param object - Server object to register links.
 */
export function registerObjectStoryLinks(object: ServerObject): void {
  const ini: IniFile = object.spawn_ini() as IniFile;

  if (ini.section_exist("story_object")) {
    const [, field, value] = ini.r_line("story_object", 0, "", "");

    assert(field === "story_id", "There is no 'story_id' field in [story_object] section [%s].", object.name());
    assert(value !== "", "Field 'story_id' in [story_object] section got no value: [%s].", object.name());

    registerStoryLink(object.id, value);

    return;
  }

  const section: TSection = object.section_name();
  const storyId: Optional<TStringId> = readIniString(SYSTEM_INI, section, "story_id", false);

  if (storyId !== null) {
    registerStoryLink(object.id, storyId);
  }
}

/**
 * Register story links based on object information.
 *
 * @param objectId - Game object ID.
 * @param storyObjectId - Game object story ID.
 */
export function registerStoryLink(objectId: TNumberId, storyObjectId: TStringId): void {
  if (registry.storyLink.idBySid.get(storyObjectId) !== null) {
    if (objectId !== registry.storyLink.idBySid.get(storyObjectId)) {
      const existingObjectName: TName = registry.simulator
        .object(registry.storyLink.idBySid.get(storyObjectId))
        ?.name() as TName;
      const newObjectName: TName = registry.simulator.object(objectId)?.name() as TName;

      abort(
        "You are trying to spawn two or more objects with the same story_id: [%s] --> [%s] try to add: [%s]",
        storyObjectId,
        existingObjectName,
        newObjectName
      );
    }
  } else if (registry.storyLink.sidById.get(objectId) !== null) {
    if (registry.storyLink.sidById.get(objectId) !== storyObjectId) {
      abort("Object [%s] is already in registry with story id: [%s]", tostring(objectId), storyObjectId);
    }
  }

  registry.storyLink.idBySid.set(storyObjectId, objectId);
  registry.storyLink.sidById.set(objectId, storyObjectId);
}

/**
 * Unregister story object link by provided object ID.
 *
 * @param objectId - Game object ID to unregister story links.
 */
export function unregisterStoryLinkByObjectId(objectId: TNumberId): void {
  if (registry.storyLink.sidById.get(objectId) !== null) {
    registry.storyLink.idBySid.delete(registry.storyLink.sidById.get(objectId));
    registry.storyLink.sidById.delete(objectId);
  }
}

/**
 * Unregister story object link by provided story ID.
 *
 * @param storyId - Story object ID to unregister story links.
 */
export function unregisterStoryLinkByStoryId(storyId: TStringId): void {
  if (registry.storyLink.idBySid.get(storyId) !== null) {
    registry.storyLink.sidById.delete(registry.storyLink.idBySid.get(storyId));
    registry.storyLink.idBySid.delete(storyId);
  }
}

/**
 * Check whether object has story link.
 *
 * @param object - Object to check.
 * @returns Whether provided object has linked story id.
 */
export function isStoryObject(object: AnyGameObject): boolean {
  if (type(object.id) === "function") {
    return registry.storyLink.sidById.has((object as GameObject).id());
  } else {
    return registry.storyLink.sidById.has((object as ServerObject).id);
  }
}

/**
 * Check whether story object exists.
 *
 * @param storyId - Story ID to check existing.
 * @returns Whether story object exists.
 */
export function isStoryObjectExisting(storyId: TStringId): boolean {
  const objectId: Optional<TNumberId> = registry.storyLink.idBySid.get(storyId);

  return objectId === null ? false : registry.simulator.object(objectId) !== null;
}

/**
 * Get object story ID by provided game object ID.
 *
 * @param objectId - Game object ID.
 * @returns Story object id.
 */
export function getStoryIdByObjectId(objectId: TNumberId): Optional<TStringId> {
  return registry.storyLink.sidById.get(objectId);
}

/**
 * Get game object ID by provided story ID.
 *
 * @param storyId - Story ID of the object.
 * @returns Game object ID.
 */
export function getObjectIdByStoryId(storyId: TStringId): Optional<TNumberId> {
  return registry.storyLink.idBySid.get(storyId);
}

/**
 * Get server object by provided story ID.
 *
 * @param storyId - Story id to search.
 * @returns Existing server object instance or null.
 */
export function getServerObjectByStoryId<T extends ServerObject>(storyId: TStringId): Optional<T> {
  const objectId: Optional<TNumberId> = registry.storyLink.idBySid.get(storyId) as Optional<TNumberId>;

  return objectId ? registry.simulator.object<T>(objectId) : null;
}

/**
 * Get game object by provided story ID.
 *
 * @param storyId - Story id to search.
 * @returns Existing game object instance or null.
 */
export function getObjectByStoryId(storyId: TStringId): Optional<GameObject> {
  const objectId: Optional<TNumberId> = registry.storyLink.idBySid.get(storyId);
  const possibleObject: Optional<GameObject> = (
    objectId === null ? null : registry.objects.get(objectId)?.object
  ) as Optional<GameObject>;

  if (possibleObject) {
    return possibleObject;
  } else if (level !== null && objectId) {
    return level.object_by_id(objectId);
  }

  return null;
}

/**
 * Get runtime object identifier by its server story object SID.
 *
 * Todo: Probably remove, is it working at all? Used with heli only.
 *
 * @param sid - Server story object SID to resolve.
 * @returns Runtime identifier of the matching object, or null when not found.
 */
export function getIdBySid(sid: TNumberId): Optional<TNumberId> {
  const object: Optional<ServerObject> = registry.simulator.story_object(sid) as Optional<ServerObject>;

  return object ? object.id : null;
}
