import { expect } from "@jest/globals";
import { ExpectationResult } from "expect";

import { LuaArray } from "@/engine/lib/types";
import { luaTableToArray } from "@/fixtures/lua/mocks/lua_utils";

/**
 * Compare two lua array tables.
 */
export function toStrictEqualLuaArrays(received: LuaArray<unknown>, actual: LuaArray<unknown>): ExpectationResult {
  expect(luaTableToArray(received)).toStrictEqual(luaTableToArray(actual));

  return { pass: true, message: () => "Expect two lua array tables to match." };
}
