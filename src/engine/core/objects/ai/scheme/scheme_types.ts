import type { AbstractScheme } from "@/engine/core/objects/ai/scheme";
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
  objectId: Optional<TNumberId>;
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
 * Generic scheme logics events to get callbacks from schemeManager subscribers.
 */
export enum ESchemeEvent {
  ACTIVATE = "activate",
  DEACTIVATE = "deactivate",
  SAVE = "save",
  UPDATE = "update",
  DEATH = "onDeath",
  CUTSCENE = "onCutscene",
  EXTRAPOLATE = "onExtrapolate",
  SWITCH_ONLINE = "onSwitchOnline",
  SWITCH_OFFLINE = "onSwitchOffline",
  HIT = "onHit",
  USE = "onUse",
  WAYPOINT = "onWaypoint",
}

/**
 * Interface implementing scheme events handler.
 * Simplifies handling of scheme signals.
 */
export interface ISchemeEventHandler {
  /**
   * todo: Description, swap params order.
   */
  activate?(isLoading: boolean, object: ClientObject): void;
  /**
   * todo: Description.
   */
  deactivate?(object: ClientObject): void;
  /**
   * todo: Description.
   */
  update?(delta: TCount): void;
  /**
   * todo: Description.
   */
  save?(delta: TCount): void;
  /**
   * todo: Description.
   */
  onSwitchOnline?(object: ClientObject): void;
  /**
   * todo: Description.
   */
  onSwitchOffline?(object: ClientObject): void;
  /**
   * Handle scheme hit callback.
   * Emits when objects are hit by something.
   *
   * @param object - target client object being hit
   * @param amount - amount of hit applied
   * @param direction - direction of hit
   * @param who - client object which is source of hit
   * @param boneIndex - index of bone being hit
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
   * Handle scheme death callback.
   * Emits when objects are dying.
   *
   * @param victim - target client object dying
   * @param who - client object who killed the object
   */
  onDeath?(victim: ClientObject, who: Optional<ClientObject>): void;
  /**
   * todo: Description.
   */
  onCutscene?(): void;
}
