import { alife, device, IsGameTypeSingle, XR_vector } from "xray16";

import { AnyArgs, Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: description
 */
export function externClassMethod<B, T extends (this: B, ...rest: AnyArgs) => any>(base: B, method: T): T {
  return function (this: void, ...args: AnyArgs) {
    return (method as any)(base, ...args);
  } as any;
}

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
 * todo:
 */
export function vectorToString(vector: Optional<XR_vector>): Optional<string> {
  if (vector === null) {
    return null;
  }

  return string.format("[%s:%s:%s]", vector.x, vector.y, vector.z);
}

/**
 * @param time - time duration in millis
 * @returns hh:mm:ss formatted time
 */
export function timeToString(time: number): string {
  const hours: number = math.floor(time / 3600000);
  const minutes: number = math.floor(time / 60000 - hours * 60);
  const seconds: number = math.floor(time / 1000 - hours * 3600 - minutes * 60);

  return string.format(
    "%s:%s:%s",
    tostring(hours),
    (minutes >= 10 ? "" : "0") + tostring(minutes),
    (seconds >= 10 ? "" : "0") + tostring(seconds)
  );
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
