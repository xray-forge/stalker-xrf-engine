import { AnyObject, Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/table");

/**
 * Check if provided container is empty collection.
 * Very lua-specific checks, do not apply TS logic here.
 */
export function isEmpty(container: Optional<LuaIterable<any>>): boolean {
  if (container === null) {
    return true;
  }

  if (type(container) === "function") {
    for (const it of container) {
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
export function copyTable(target: AnyObject, source: AnyObject): void {
  for (const [k, v] of pairs(source as LuaIterable<string, any>)) {
    if (type(v) == "table") {
      target[k] = {};
      copyTable(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

/**
 * todo: description
 */
export function clearTable(tbl: LuaTable): void {
  while (tbl.length() !== 0) {
    table.remove(tbl, tbl.length());
  }
}
