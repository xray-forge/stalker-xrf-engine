import { jest } from "@jest/globals";

import { LuaArray } from "@/engine/lib/types";
import { MockLuaLogger } from "@/fixtures/engine/mocks/LuaLogger.mock";
import { mockTableUtils } from "@/fixtures/engine/mocks/table.mocks";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

/**
 * todo;
 */
export function mockEngineGlobals(): void {
  jest.mock("@/engine/core/utils/logging", () => ({
    LuaLogger: MockLuaLogger,
  }));

  jest.mock("@/engine/core/utils/table", () => mockTableUtils);

  // @ts-ignore
  global._G = global;

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
