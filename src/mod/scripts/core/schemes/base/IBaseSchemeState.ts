import type { XR_game_object, XR_ini_file } from "xray16";

import type { AnyObject, EScheme, LuaArray, Optional, TName, TNumberId, TSection, TTimestamp } from "@/mod/lib/types";
import type { TConditionList } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface IBaseSchemeLogic {
  name: TName;
  condlist: TConditionList;
  npc_id: Optional<TNumberId>;
  v1: Optional<string | number>;
  v2: Optional<string | number>;
}

/**
 * todo;
 */
export interface IBaseSchemeState {
  npc: XR_game_object;
  ini: XR_ini_file;
  logic: Optional<LuaArray<IBaseSchemeLogic>>;
  signals: Optional<LuaTable<TName, boolean>>; // Rework with LuaSet?
  scheme: EScheme;
  section: Optional<TSection>;
  actions?: LuaTable<AnyObject, boolean>;
  idle_end: TTimestamp;
  overrides: Optional<AnyObject>;
}
