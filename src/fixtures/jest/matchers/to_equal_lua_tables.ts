import { expect } from "@jest/globals";
import { ExpectationResult } from "expect";
import { luaTableToObject } from "xray16/mocks";

/**
 * Compare two lua tables.
 *
 * @param received - Received table for comparison.
 * @param expected - Expected table for comparison.
 */
export function toEqualLuaTables(
  received: LuaTable<string | number>,
  expected: LuaTable<string | number>
): ExpectationResult {
  expect(luaTableToObject(received)).toEqual(luaTableToObject(expected));

  return { pass: true, message: () => "Expect two lua tables to match." };
}
