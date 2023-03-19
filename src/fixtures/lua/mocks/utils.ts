import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

/**
 * todo;
 */
export function luaTableToArray<T>(value: LuaTable<number, T>): Array<T> {
  if (value instanceof MockLuaTable) {
    return [...(value as unknown as Map<number, T>).values()].map((it) => {
      return mapFromLua<any>(it);
    });
  } else {
    throw new Error(`Unexpected type instance provided for casting utility: '${typeof value}'.`);
  }
}

/**
 * todo;
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
