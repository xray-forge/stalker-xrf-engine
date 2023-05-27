import { registry } from "@/engine/core/database";
import { AnyObject, ClientObject, Optional } from "@/engine/lib/types";

/**
 * todo;
 * todo;
 * todo;
 */
export function getObjectGenericSchemeOverrides(object: ClientObject): Optional<LuaTable<string>> {
  return $fromObject(registry.objects.get(object.id()).overrides as AnyObject);
}
