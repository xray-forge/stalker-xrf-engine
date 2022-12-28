import { device, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/general");

/**
 * todo: description
 */
export function round(value: number): number {
  const min: number = math.floor(value);
  const max: number = min + 1;

  return value - min >= max - value ? max : min;
}

/**
 * todo: description
 * todo: Probably unused
 */
export function add(x: number): boolean {
  return math.floor(x * 0.5) * 2 === math.floor(x);
}

/**
 * todo: description
 */
export function ifThenElse<A, B>(condition: boolean, ifTrue: A, ifFalse: B): A | B {
  return condition ? ifTrue : ifFalse;
}

/**
 * todo: description
 */
export function randomChoice<T>(...args: Array<T>): T {
  return args[math.random(0, args.length - 1)];
}

/**
 * todo: description
 * - Probably needs improvement since seed is same if calls happening almost instantly, needs nanotime or different seed
 */
export function randomNumber(min?: number, max?: number): number {
  math.randomseed(device().time_global());

  if (min === null && max === null) {
    return math.random();
  } else {
    return math.random(min, max);
  }
}

/**
 * -- ��������� ������ � ������.
 * function vec_to_str (vector)
 *  if vector == nil then return "nil" end
 *  return string.format("[%s:%s:%s]", vector.x, vector.y, vector.z)
 * end
 */
export function vectorToString(vector: Optional<XR_vector>): Optional<string> {
  if (vector === null) {
    return null;
  }

  return string.format("[%s:%s:%s]", vector.x, vector.y, vector.z);
}
