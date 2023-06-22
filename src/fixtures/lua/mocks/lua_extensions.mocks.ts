import { LuaArray } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";

/**
 * Mock extensions to lua globals.
 */
export function mockLuaExtensions(): void {
  // @ts-ignore
  global.$filename = "JEST_TEST";

  /*
   * For jest env mock casting.
   */
  global.$fromArray = <T>(array: Array<T>): LuaArray<T> => {
    const result: MockLuaTable<number, T> = new MockLuaTable();

    array.forEach((it, index) => result.set(index + 1, it));

    return result as unknown as LuaArray<T>;
  };

  /*
   * For jest env mock casting.
   */
  global.$fromObject = <K extends string | number, T>(record: Record<K, T>): LuaTable<K, T> => {
    return new MockLuaTable(Object.entries(record)) as unknown as LuaTable<K, T>;
  };
}
