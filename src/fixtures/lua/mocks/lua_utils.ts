import type { AnyObject, LuaArray, Optional } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

/**
 * Transform lua table to array for easier testing with equals checks.
 */
export function luaTableToArray<T = unknown>(value: Optional<LuaArray<T>>): Array<T> {
  if (value instanceof MockLuaTable) {
    return [...(value as unknown as Map<number, T>).values()].map((it) => {
      return mapFromLua<any>(it);
    });
  } else if (Array.isArray(value)) {
    return value.map((it) => mapFromLua(it));
  } else {
    throw new Error(`Unexpected type instance provided for casting utility: '${typeof value}'.`);
  }
}

/**
 * Transform in a recursive way lua tables to JS arrays for easier testing/verification.
 */
export function luaTableToObject(value: Optional<LuaTable | AnyObject | Array<unknown>>): Optional<AnyObject> {
  if (value === null) {
    return value;
  }

  if (value instanceof MockLuaTable) {
    return [...value.entries()].reduce((acc, [key, value]) => {
      acc[key] = luaTableToObject(value);

      return acc;
    }, {} as AnyObject);
  } else if (Array.isArray(value)) {
    return value.reduce((acc, it, index) => {
      acc[index + 1] = luaTableToObject(it);

      return acc;
    }, {});
  } else if (typeof value === "object") {
    if ((value as AnyObject)["$$typeof"]) {
      return value;
    }

    return Object.entries(value).reduce((acc, [key, value]) => {
      acc[key as unknown as string] = luaTableToObject(value);

      return acc;
    }, {} as AnyObject);
  } else {
    return value;
  }
}

/**
 * @param value - lua table, object or class instance to transform
 * @returns object based map from lua value
 */
export function mapFromLua<T>(value: T): T {
  if (value instanceof MockLuaTable) {
    return [...(value as unknown as Map<any, any>).entries()].reduce((acc: Record<any, any>, [key, value]) => {
      acc[key] = mapFromLua(value);

      return acc;
    }, {});
  } else if (value?.constructor === Object) {
    return Object.entries(value).reduce((acc: Record<any, any>, [key, value]) => {
      acc[key] = mapFromLua(value);

      return acc;
    }, {});
  } else {
    return value;
  }
}
