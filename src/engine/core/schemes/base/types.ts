import type { AbstractScheme } from "@/engine/core/schemes";
import type { TConditionList } from "@/engine/core/utils/ini/ini_types";
import type {
  AnyObject,
  ClientObject,
  EScheme,
  IniFile,
  LuaArray,
  Optional,
  TCount,
  TIndex,
  TName,
  TNumberId,
  TSection,
  TTimestamp,
  Vector,
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
  /**
   * List of signals in active scheme state.
   * Signals are flags indicating whether some action/thing happened.
   */
  signals: Optional<LuaTable<TName, boolean>>; // Rework with LuaSet?
  scheme: EScheme;
  section: Optional<TSection>;
  actions?: LuaTable<AnyObject, boolean>;
  idle_end: TTimestamp;
  overrides: Optional<AnyObject>;
}

/**
 * todo;
 * todo: Implement net spawn, rename netDestroy
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

/**
 * Interface implementing scheme events handler.
 * Simplifies handling of scheme signals.
 */
export interface ISchemeEventHandler {
  /**
   * todo: Description.
   */
  update?(delta: TCount): void;
  /**
   * todo: Description.
   */
  activateScheme?(isLoading: boolean, object: ClientObject): void;
  /**
   * todo: Description.
   */
  resetScheme?(isLoading: boolean, object: ClientObject): void;
  /**
   * todo: Description.
   */
  deactivate?(): void;
  /**
   * todo: Description.
   */
  net_spawn?(): void;
  /**
   * todo: Description.
   */
  net_destroy?(object: ClientObject): void;
  /**
   * todo: Description.
   */
  onHit?(object: ClientObject, amount: TCount, direction: Vector, who: Optional<ClientObject>, boneIndex: TIndex): void;
  /**
   * todo: Description.
   */
  onUse?(object: ClientObject, who: Optional<ClientObject>): void;
  /**
   * todo: Description.
   */
  onWaypoint?(object: ClientObject, actionType: TName, index: TIndex): void;
  /**
   * todo: Description.
   */
  onDeath?(victim: ClientObject, who: Optional<ClientObject>): void;
  /**
   * todo: Description.
   */
  onCutscene?(): void;
}
