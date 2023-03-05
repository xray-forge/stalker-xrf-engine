import type { XR_game_object, XR_ini_file } from "xray16";

import type { EScheme, Optional, TSection } from "@/mod/lib/types";

/**
 * todo;
 */
export interface IBaseSchemeState {
  npc: XR_game_object;
  ini: XR_ini_file;
  scheme: EScheme;
  section: Optional<TSection>;
  actions?: LuaTable;
}
