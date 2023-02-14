import { XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { storage } from "@/mod/scripts/core/db";

/**
 * todo;
 * todo;
 * todo;
 */
export function generic_scheme_overrides(npc: XR_game_object): Optional<LuaTable<string>> {
  return storage.get(npc.id()).overrides as unknown as LuaTable<string>;
}
