import { LuaArray } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";

/**
 * Mock extensions to lua globals.
 */
export function mockLuaExtensions(): void {
  // @ts-ignore
  globalThis.$filename = "JEST_TEST";
  // @ts-ignore
  globalThis.$dirname = "JEST_TEST";

  /*
   * For jest env mock casting.
   */
  globalThis.$fromArray = <T>(array: Array<T>): LuaArray<T> => {
    return MockLuaTable.fromArray(array) as unknown as LuaArray<T>;
  };

  /*
   * For jest env mock casting.
   */
  globalThis.$fromObject = <K extends string | number, T>(record: Record<K, T>): LuaTable<K, T> => {
    return MockLuaTable.fromObject(record) as unknown as LuaTable<K, T>;
  };

  /*
   * For jest env mock casting.
   */
  globalThis.$fromLuaTable = <K extends string | number, T>(record: LuaTable<K, T>): Record<K, T> => {
    return MockLuaTable.mockToObject(record);
  };

  /*
   * For jest env mock casting.
   */
  globalThis.$fromLuaArray = <T>(array: LuaTable<number, T>): Array<T> => {
    return MockLuaTable.mockToArray(array);
  };
}
