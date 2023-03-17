import { XR_game_object } from "xray16";

import { Optional } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";

/**
 * todo;
 * todo;
 * todo;
 */
export function generic_scheme_overrides(object: XR_game_object): Optional<LuaTable<string>> {
  return registry.objects.get(object.id()).overrides as unknown as LuaTable<string>;
}
