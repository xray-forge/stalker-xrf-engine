import type { Flags32, LuaArray, Optional, TCount, TIndex, TName, TProbability, TSection } from "@/engine/lib/types";

/**
 * Data descriptor describing waypoint logics.
 */
export interface IWaypointData {
  /**
   * Animation state when moving on waypoint.
   */
  a: Optional<TConditionList>;
  s?: string;
  b?: string;
  r?: string;
  /**
   * todo;
   */
  ret: Optional<string>;
  /**
   * Probability to stop on walk point when reaching it.
   * Expected number in range 0-100.
   */
  p: Optional<string>;
  d?: string;
  radius?: number;
  state?: string;
  /**
   * Signal to set on animation termination (callback / finish animation).
   */
  sigtm?: TName;
  minr?: string;
  maxr?: string;
  c?: string;
  /**
   * Signal to set when reaching `walk` waypoint.
   */
  sig: Optional<TName>;
  /**
   * Whether patrol should synchronize on the waypoint.
   * Forces all patrol participants to come to the point before setting the flag.
   */
  syn?: string;
  count?: number;
  /**
   * Timeout for `look_point` animation.
   * Describes time for stopping near `walk_point`.
   */
  t: Optional<number | "*">;
  flags: Flags32;
}

/**
 * todo;
 */
export interface ISpawnDescriptor {
  count: TCount;
  probability: TProbability;
}

/**
 * Descriptor describing parsed condition in one conditions list.
 */
export interface IConfigCondition {
  name?: TName;
  func?: TName;
  required?: boolean;
  expected?: boolean;
  prob?: TProbability;
  params?: Optional<LuaArray<string | number>>;
}

/**
 * todo;
 */
export interface IConfigSwitchCondition {
  readonly section: TSection;
  readonly infop_check: LuaArray<IConfigCondition>;
  readonly infop_set: LuaArray<IConfigCondition>;
}

export type TConditionList = LuaArray<IConfigSwitchCondition>;

/**
 * todo; probably remove?
 */
export interface IConfigSwitchConditionsDescriptor {
  name: TName;
  condlist: TConditionList;
}

/**
 * Complex condition list containing multiple switch/effects conditions.
 */

/**
 * State descriptor describing bone state.
 */
export interface IBoneStateDescriptor {
  index: Optional<TIndex>; // Bone index.
  state: Optional<TConditionList>; // Matching state.
}
