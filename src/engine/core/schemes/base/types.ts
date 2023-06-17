import type { AbstractScheme } from "@/engine/core/schemes";
import type { TConditionList } from "@/engine/core/utils/ini/types";
import type {
  AnyObject,
  ClientObject,
  EScheme,
  IniFile,
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
export type TAbstractSchemeConstructor = typeof AbstractScheme;

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
  npc: ClientObject;
  ini: IniFile;
  /**
   * List of switch conditions.
   * Based on logic check one scheme section can be switched to another if condlists provide next section.
   */
  logic: Optional<LuaArray<IBaseSchemeLogic>>;
  signals: Optional<LuaTable<TName, boolean>>; // Rework with LuaSet?
  scheme: EScheme;
  section: Optional<TSection>;
  actions?: LuaTable<AnyObject, boolean>;
  idle_end: TTimestamp;
  overrides: Optional<AnyObject>;
}

/**
 * todo;
 */
export enum ESchemeEvent {
  ACTIVATE_SCHEME = "activateScheme",
  DEACTIVATE = "deactivate", // todo: Rename to deactivate scheme
  DEATH = "onDeath",
  CUTSCENE = "onCutscene",
  EXTRAPOLATE = "onExtrapolate",
  NET_DESTROY = "net_destroy",
  HIT = "onHit",
  RESET_SCHEME = "resetScheme", // todo: Probably merge with activate scheme or rename it to activateRestrictorScheme
  SAVE = "save",
  UPDATE = "update",
  USE = "onUse",
  WAYPOINT = "onWaypoint",
}
