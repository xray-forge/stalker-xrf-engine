import { AnyObject } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

/**
 * Mock table utils for correct interoperation with typescript.
 */
export const mockTableUtils = {
  isEmpty: (target: AnyObject): boolean => {
    if (target === null) {
      return true;
    }

    if (target instanceof MockLuaTable) {
      return target.length() === 0;
    } else {
      return Object.keys(target).length === 0;
    }
  },
  copyTable: (target: AnyObject, source: AnyObject) => {
    if (target instanceof MockLuaTable && source instanceof MockLuaTable) {
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
    if (destination instanceof MockLuaTable) {
      for (const it of rest) {
        if (it instanceof MockLuaTable) {
          for (const [k, v] of it.entries()) {
            destination.set(k, v);
          }
        } else {
          Object.entries(it).forEach(([k, v]) => destination.set(k, v));
        }
      }
    } else {
      for (const it of rest) {
        Object.assign(destination, it instanceof MockLuaTable ? it.values() : it);
      }
    }

    return destination;
  },
};
