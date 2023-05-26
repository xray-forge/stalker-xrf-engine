import type { game_object, ini_file } from "xray16";

import type { TConditionList } from "@/engine/core/utils/parse";
import type {
  AnyObject,
  EScheme,
  LuaArray,
  Optional,
  TName,
  TNumberId,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

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
  npc: game_object;
  ini: ini_file;
  logic: Optional<LuaArray<IBaseSchemeLogic>>;
  signals: Optional<LuaTable<TName, boolean>>; // Rework with LuaSet?
  scheme: EScheme;
  section: Optional<TSection>;
  actions?: LuaTable<AnyObject, boolean>;
  idle_end: TTimestamp;
  overrides: Optional<AnyObject>;
}
