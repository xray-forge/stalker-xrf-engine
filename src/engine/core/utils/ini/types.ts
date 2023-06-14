import type { TInfoPortion } from "@/engine/lib/constants/info_portions";
import type { Flags32, LuaArray, Optional, TName, TProbability, TSection } from "@/engine/lib/types";

/**
 * todo;
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

/**
 * todo;
 */
export interface IConfigSwitchConditionsDescriptor {
  name: TName;
  condlist: LuaArray<IConfigSwitchCondition>;
}

/**
 * todo;
 */
export type TConditionList = LuaArray<IConfigSwitchCondition>;
