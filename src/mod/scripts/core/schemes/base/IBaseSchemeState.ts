import type { XR_game_object, XR_ini_file } from "xray16";

import type { EScheme, LuaArray, Optional, TSection } from "@/mod/lib/types";

/**
 * todo;
 */
export interface IBaseSchemeState {
  npc: XR_game_object;
  ini: XR_ini_file;
  logic: Optional<LuaArray<any>>;
  signals: Optional<LuaTable<string, boolean>>;
  scheme: EScheme;
  section: Optional<TSection>;
  actions?: LuaTable;
}
