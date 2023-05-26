import { game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { AnyObject, Optional } from "@/engine/lib/types";

/**
 * todo;
 * todo;
 * todo;
 */
export function getObjectGenericSchemeOverrides(object: game_object): Optional<LuaTable<string>> {
  return $fromObject(registry.objects.get(object.id()).overrides as AnyObject);
}
