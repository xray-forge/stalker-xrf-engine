import { $fromArray } from "xray16/macros";

import { AnyObject } from "@/engine/lib/types";

/**
 * Mock table utils for correct interoperation with typescript.
 */
export const mockTableUtils = {
  isEmpty: (target: AnyObject): boolean => {
    if (target === null) {
      return true;
    }

    if (target instanceof Map) {
      return target.size === 0;
    } else {
      return Object.keys(target).length === 0;
    }
  },
  copyTable: (target: AnyObject, source: AnyObject) => {
    if (target instanceof LuaTable && source instanceof LuaTable) {
      for (const [k, v] of source) {
        target.set(k, v);
      }

      return target;
    }

    return Object.assign(target, source);
  },
  resetTable: (table: Map<unknown, unknown>) => {
    for (const [k] of table) {
      table.delete(k);
    }
  },
  mergeTables: (destination: LuaTable | AnyObject, ...rest: Array<AnyObject | LuaTable>) => {
    if (destination instanceof Map) {
      for (const it of rest) {
        if (it instanceof Map) {
          for (const [k, v] of it.entries()) {
            destination.set(k, v);
          }
        } else {
          Object.entries(it).forEach(([k, v]) => destination.set(k, v));
        }
      }
    } else {
      for (const it of rest) {
        Object.assign(destination, it instanceof Map ? it.values() : it);
      }
    }

    return destination;
  },
  getTableKeys: (from: LuaTable | AnyObject) => {
    if (from instanceof Map) {
      return $fromArray([...from.keys()]);
    } else {
      return $fromArray(Object.keys(from));
    }
  },
  getTableValuesAsSet: (from: LuaTable | AnyObject) => {
    if (from instanceof Map) {
      const result = new LuaTable();

      for (const [, value] of from) {
        result.set(value, true);
      }

      return result;
    } else {
      const result = new LuaTable();

      for (const value of Object.values(from)) {
        result.set(value, true);
      }

      return result;
    }
  },
};
