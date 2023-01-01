import { AnyObject, Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/table");

/**
 * Check if provided container is empty collection.
 * Very lua-specific checks, do not apply TS logic here.
 */
export function isEmpty(container: Optional<LuaTable<any>>): boolean {
  if (container === null) {
    return true;
  }

  if (type(container) === "function") {
    for (const [k, v] of container) {
      return false;
    }

    return true;
  }

  assert(type(container) == "table");

  if ((container as AnyObject)[1] !== null) {
    return false;
  }

  for (const [k, v] of pairs(container)) {
    return false;
  }

  return true;
}

/**
 * todo: description
 */
export function getTableSize(collection: LuaTable<any, any>): number {
  let count: number = 0;

  for (const [k, v] of collection) {
    count += 1;
  }

  return count;
}

/**
 * todo: description
 */
export function copyTable(target: LuaTable<string | number>, source: LuaTable<string | number>): void {
  for (const [k, v] of source) {
    if (type(v) == "table") {
      target.set(k, new LuaTable());
      copyTable(target.get(k), v);
    } else {
      target.set(k, v);
    }
  }
}

/**
 * todo: description
 */
export function clearTable(target: LuaTable): void {
  while (target.length() !== 0) {
    table.remove(target as any, target.length());
  }
}
