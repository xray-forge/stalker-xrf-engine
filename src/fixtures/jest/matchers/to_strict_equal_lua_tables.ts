import { expect } from "@jest/globals";
import { ExpectationResult } from "expect";

import { luaTableToObject } from "@/fixtures/lua/mocks/lua_utils";

/**
 * Compare two lua tables.
 */
export function toStrictEqualLuaTables(received: LuaTable, actual: LuaTable): ExpectationResult {
  expect(luaTableToObject(received)).toStrictEqual(luaTableToObject(actual));

  return { pass: true, message: () => "Expect two lua tables to match." };
}
