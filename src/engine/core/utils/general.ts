import { alife, device, IsGameTypeSingle, XR_vector } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
 * todo:
 */
export function vectorToString(vector: Optional<XR_vector>): Optional<string> {
  if (vector === null) {
    return null;
  }

  return string.format("[%s:%s:%s]", vector.x, vector.y, vector.z);
}

/**
 * todo
 */
export function isSinglePlayerGame(): boolean {
  if (alife === null || alife() !== null) {
    return true;
  } else if (IsGameTypeSingle === null || IsGameTypeSingle()) {
    return true;
  }

  return false;
}
