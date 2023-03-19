import { AnyObject } from "@/engine/lib/types";

/**
 * Utility to declare global variables and extern them for game engine usage.
 * Declared values can be found in _G / global LUA scope.
 *
 * @param key - name of the value to extern
 * @param value - value to extern
 * @param target - object to set value, global _G by default
 */
export function extern(key: string, value: unknown, target: AnyObject = _G): void {
  const entries: Array<string> = key.split(".");

  key = entries[0];

  for (const match of entries.slice(1)) {
    if (!target[key]) {
      target[key] = {};
    }

    target = target[key];
    key = match;
  }

  target[key] = value;
}

/**
 * Get LUA globals/extern values with utility.
 *
 * @param key - name of value to be retrieved
 * @param target - object to get value, global _G by default
 */
export function getExtern<T>(key: string, target: AnyObject = _G): T {
  const matches = key.split(".");
  let value = target[matches[0]];

  for (const match of matches.slice(1)) {
    value = value[match];
  }

  return value;
}
