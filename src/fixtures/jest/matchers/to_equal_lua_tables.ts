import { expect } from "@jest/globals";
import { ExpectationResult } from "expect";

import { luaTableToObject } from "@/fixtures/lua/mocks/lua_utils";

/**
 * Compare two lua tables.
 *
 * @param received - Received table for comparison.
 * @param expected - Expected table for comparison.
 */
export function toEqualLuaTables(received: LuaTable, expected: LuaTable): ExpectationResult {
  expect(luaTableToObject(received)).toEqual(luaTableToObject(expected));

  return { pass: true, message: () => "Expect two lua tables to match." };
}
