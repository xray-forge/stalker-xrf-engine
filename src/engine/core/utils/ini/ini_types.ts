import type { TInfoPortion } from "@/engine/lib/constants/info_portions";
import type { Flags32, LuaArray, Optional, TCount, TIndex, TName, TProbability, TSection } from "@/engine/lib/types";

/**
 * Data descriptor describing waypoint.
 */
export interface IWaypointData {
  a?: any;
  s?: string;
  b?: string;
  r?: string;
  ret?: string;
  p?: string;
  d?: string;
  radius?: number;
  state?: string;
  sigtm?: string;
  minr?: string;
  maxr?: string;
  c?: string;
  sig?: string;
  syn?: string;
  count?: number;
  t?: number | "*";
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
  name?: TInfoPortion;
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
