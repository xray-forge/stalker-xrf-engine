import { expect } from "@jest/globals";
import { ExpectationResult } from "expect";

import { luaTableToArray } from "@/fixtures/lua/mocks/lua_utils";

/**
 * Compare two lua array tables.
 */
export function toEqualLuaArrays(
  received: LuaTable<number, unknown>,
  actual: LuaTable<number, unknown>
): ExpectationResult {
  expect(luaTableToArray(received)).toEqual(luaTableToArray(actual));

  return { pass: true, message: () => "Expect two lua array tables to match." };
}
