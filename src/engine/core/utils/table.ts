import { AnyObject, LuaArray, Optional } from "@/engine/lib/types";

/**
 * Check if provided container is empty collection.
 * Very lua-specific checks, do not apply TS logic here.
 *
 * @param target - Object to check emptiness.
 * @returns Whether target table is empty.
 */
export function isEmpty(target: Optional<LuaTable<any>>): target is LuaTable {
  if (target === null) {
    return true;
  }

  for (const [_] of target) {
    return false;
  }

  return true;
}

/**
 * Copy table values from one table to another.
 * Tables are copied recursively.
 *
 * @param target - Table to copy in.
 * @param source - Table to copy from.
 * @returns Target table with copied content.
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
 * @param destination - Target to merge all the lua tables.
 * @param rest - List of tables to merge.
 * @returns Resulting merged table.
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
 * @param target - Table to reset and empty.
 */
export function resetTable(target: LuaTable<any>): void {
  for (const [k] of target) {
    target.delete(k);
  }
}

/**
 * Get list of table keys as new table.
 *
 * @param target - Table to get list of keys from.
 * @returns List of table keys.
 */
export function getTableKeys<TKey extends AnyNotNil = AnyNotNil>(target: LuaTable<TKey>): LuaArray<TKey> {
  const keys: LuaArray<TKey> = new LuaTable();

  for (const [key] of target) {
    table.insert(keys, key);
  }

  return keys;
}

/**
 * Get table values as set object.
 *
 * @param target - Table to create set from.
 * @returns Set of target table values.
 */
export function getTableValuesAsSet<TValue extends AnyNotNil = AnyNotNil>(
  target: LuaTable<any, TValue> | AnyObject
): LuaTable<TValue, boolean> {
  const set: LuaTable<TValue, boolean> = new LuaTable();

  for (const [, value] of target as LuaTable<AnyNotNil, TValue>) {
    set.set(value, true);
  }

  return set;
}
