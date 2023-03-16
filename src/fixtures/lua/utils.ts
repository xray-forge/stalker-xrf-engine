import { LuaTableMock } from "@/fixtures/lua/LuaTable.mock";

/**
 * todo;
 */
export function luaTableToArray<T>(table: LuaTable<number, T>): Array<T> {
  if (table instanceof LuaTableMock) {
    return [...(table as unknown as Map<number, T>).values()];
  } else {
    throw new Error(`Unexpected type instance provided for casting utility: '${typeof table}'.`);
  }
}
