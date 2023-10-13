import { setPortableStoreValue } from "@/engine/core/database/portable_store";
import { registry } from "@/engine/core/database/registry";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { ClientObject, TNumberId } from "@/engine/lib/types";

/**
 * Register object as wounded so others can detect it for searching and helping.
 *
 * @param object - client object to register as wounded
 */
export function registerWoundedObject(object: ClientObject): void {
  const objectId: TNumberId = object.id();

  registry.objectsWounded.set(objectId, registry.objects.get(objectId));
}

/**
 * Unregister object as wounded so others will not detect it for helping.
 *
 * @param object - client object to unregister
 */
export function unRegisterWoundedObject(object: ClientObject): void {
  setPortableStoreValue(object.id(), helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY, null);
  registry.objectsWounded.delete(object.id());
}
