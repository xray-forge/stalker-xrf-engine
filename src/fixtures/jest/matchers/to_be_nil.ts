import { expect } from "@jest/globals";
import { ExpectationResult } from "expect";
import { $isNil } from "xray16/macros";

/**
 * Assert value matching LUA nil - null or undefined.
 */
export function toBeNil(received: LuaTable<number, unknown>): ExpectationResult {
  expect($isNil(received)).toBe(true);

  return { pass: true, message: () => "Expect value to match LUA nil ('null' or 'undefined')." };
}
