import { expect } from "@jest/globals";
import { ExpectationResult } from "expect";

import { luaTableToObject } from "@/fixtures/lua/mocks/lua_utils";

/**
 * Compare two lua tables.
 */
export function toEqualLuaTables(received: LuaTable, actual: LuaTable): ExpectationResult {
  expect(luaTableToObject(received)).toEqual(luaTableToObject(actual));

  return { pass: true, message: () => "Expect two lua tables to match." };
}
