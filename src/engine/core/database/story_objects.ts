import { alife, level } from "xray16";

import { SYSTEM_INI } from "@/engine/core/database/ini_registry";
import { registry } from "@/engine/core/database/registry";
import { abort, assert } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini/read";
import { ClientObject, IniFile, Optional, ServerObject, TName, TNumberId, TStringId } from "@/engine/lib/types";

/**
 * Register story object link based on ini configuration.
 *
 * @param serverObject - server object to register links
 */
export function registerObjectStoryLinks(serverObject: ServerObject): void {
  const spawnIni: IniFile = serverObject.spawn_ini();

  if (spawnIni.section_exist("story_object")) {
    const [result, id, value] = spawnIni.r_line("story_object", 0, "", "");

    assert(id === "story_id", "There is no 'story_id' field in [story_object] section [%s].", serverObject.name());
    assert(value !== "", "Field 'story_id' in [story_object] section got no value: [%s].", serverObject.name());

    registerStoryLink(serverObject.id, value);

    return;
  }

  const spawnSection: TName = serverObject.section_name();
  const storyId: Optional<TStringId> = readIniString(SYSTEM_INI, spawnSection, "story_id", false, "", null);

  if (storyId !== null) {
    registerStoryLink(serverObject.id, storyId);
  }
}

/**
 * Register story links based on object information.
 *
 * @param objectId - game object ID
 * @param storyObjectId - game object story ID
 */
export function registerStoryLink(objectId: TNumberId, storyObjectId: TStringId): void {
  if (registry.storyLink.idBySid.get(storyObjectId) !== null) {
    if (objectId !== registry.storyLink.idBySid.get(storyObjectId)) {
      const existingObjectName: TName = alife().object(registry.storyLink.idBySid.get(storyObjectId))?.name() as TName;
      const newObjectName: TName = alife().object(objectId)?.name() as TName;

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
 * @param objectId - game object ID to unregister story links
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
 * @param storyId - story object ID to unregister story links
 */
export function unregisterStoryLinkByStoryId(storyId: TStringId): void {
  if (registry.storyLink.idBySid.get(storyId) !== null) {
    registry.storyLink.sidById.delete(registry.storyLink.idBySid.get(storyId));
    registry.storyLink.idBySid.delete(storyId);
  }
}

/**
 * Get object story ID by provided game object ID.
 *
 * @param objectId - game object ID
 * @returns story object id
 */
export function getStoryIdByObjectId(objectId: TNumberId): Optional<TStringId> {
  return registry.storyLink.sidById.get(objectId);
}

/**
 * Get game object ID by provided story ID.
 *
 * @param storyId - story ID of the object
 * @returns game object ID
 */
export function getObjectIdByStoryId(storyId: TStringId): Optional<TNumberId> {
  return registry.storyLink.idBySid.get(storyId);
}

/**
 * Get server object by provided story ID.
 *
 * @param storyId - story id to search
 * @returns existing server object instance or null
 */
export function getServerObjectByStoryId<T extends ServerObject>(storyId: TStringId): Optional<T> {
  const objectId: Optional<TNumberId> = registry.storyLink.idBySid.get(storyId);

  return objectId === null ? null : alife().object<T>(objectId);
}

/**
 * Get client object by provided story ID.
 *
 * @param storyId - story id to search
 * @returns existing client object instance or null
 */
export function getObjectByStoryId(storyId: TStringId): Optional<ClientObject> {
  const objectId: Optional<TNumberId> = registry.storyLink.idBySid.get(storyId);
  const possibleObject: Optional<ClientObject> = (
    objectId === null ? null : registry.objects.get(objectId)?.object
  ) as Optional<ClientObject>;

  if (possibleObject) {
    return possibleObject;
  } else if (level && objectId !== null) {
    return level.object_by_id(objectId);
  }

  return null;
}

/**
 * todo;
 * todo: Probably remove, is it working at all? Used with heli only.
 */
export function getIdBySid(sid: TNumberId): Optional<TNumberId> {
  return alife()?.story_object(sid)?.id;
}
