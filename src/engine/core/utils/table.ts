import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check if provided container is empty collection.
 * Very lua-specific checks, do not apply TS logic here.
 *
 * @param target - object to check emptiness
 * @returns whether target table is empty
 */
export function isEmpty(target: Optional<LuaTable<any>>): target is LuaTable {
  if (target === null) {
    return true;
  }

  if (type(target) === "function") {
    for (const [k] of target) {
      return false;
    }

    return true;
  }

  assert(type(target) === "table", "Received not table type for emptiness check.");

  if (1 in target) {
    return false;
  }

  for (const [k] of target) {
    return false;
  }

  return true;
}

/**
 * Copy table values from one table to another.
 * Tables are copied recursively.
 *
 * @param target - table to copy in
 * @param source - table to copy from
 * @returns target table with copied content
 */
export function copyTable<T extends Record<any, any>, D extends Record<any, any>>(target: T, source: D): T;
export function copyTable(
  target: LuaTable<string | number>,
  source: LuaTable<string | number>
): LuaTable<string | number> {
  for (const [key, value] of source) {
    if (type(value) === "table") {
      target.set(key, new LuaTable());
      copyTable(target.get(key), value);
    } else {
      target.set(key, value);
    }
  }

  return target;
}

/**
 * Merge tables into single destination.
 *
 * @param destination - target to merge all the lua tables
 * @param rest - list of tables to merge
 * @returns resulting merged table
 */
export function mergeTables<K extends AnyNotNil, V>(
  destination: LuaTable<K, V>,
  ...rest: Array<LuaTable<K, V>>
): LuaTable<K, V> {
  for (const it of rest) {
    copyTable(destination, it);
  }

  return destination;
}

/**
 * Reset table values in map-styled table.
 *
 * @param target - table to reset and empty
 */
export function resetTable(target: LuaTable<any>): void {
  for (const [k] of target) {
    target.delete(k);
  }
}
