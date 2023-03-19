import { AnyObject } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

/**
 * Mock table utils for correct interoperation with typescript.
 */
export const mockTableUtils = {
  copyTable: (target: AnyObject, source: AnyObject) => Object.assign(target, source),
  getTableSize: (target: unknown): number => {
    if (target instanceof MockLuaTable) {
      return target.length();
    } else if (Array.isArray(target)) {
      return target.length;
    } else if (target && typeof target === "object") {
      return Object.keys(target).length;
    } else {
      throw new Error("Unexpected data provided for table size check mock.");
    }
  },
};
