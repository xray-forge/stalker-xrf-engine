import { expect } from "@jest/globals";
import { ExpectationResult } from "expect";
import { luaTableToObject } from "xray16/mocks";

/**
 * Compare two lua tables.
 */
export function toStrictEqualLuaTables(
  received: LuaTable<string | number>,
  actual: LuaTable<string | number>
): ExpectationResult {
  expect(luaTableToObject(received)).toStrictEqual(luaTableToObject(actual));

  return { pass: true, message: () => "Expect two lua tables to match." };
}
