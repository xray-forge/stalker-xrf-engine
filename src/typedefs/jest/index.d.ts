import { ExpectationResult } from "expect";

export * from "expect";

/**
 * Extension methods for jest expect checks.
 */
declare module "expect" {
  export interface Matchers<R extends void | Promise<void>> {
    toEqualLuaTables(expected: Record<string, any> | LuaTable): ExpectationResult;
    toStrictEqualLuaTables(expected: Record<string, any> | LuaTable): ExpectationResult;
    toEqualLuaArrays(expected: Array<unknown> | LuaTable<number, unknown>): ExpectationResult;
    toStrictEqualLuaArrays(expected: Array<unknown> | LuaTable<number, unknown>): ExpectationResult;
  }
}
