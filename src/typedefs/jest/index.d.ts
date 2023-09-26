export * from "expect";

/**
 * Extension methods for jest expect checks.
 */
declare module "expect" {
  export interface Matchers<R extends void | Promise<void>> {
    toEqualLuaTables(expected: Record<string, any> | LuaTable | null): ExpectationResult;
    toStrictEqualLuaTables(expected: Record<string, any> | LuaTable | null): ExpectationResult;
    toEqualLuaArrays(expected: Array<unknown> | LuaTable<number, unknown> | null): ExpectationResult;
    toStrictEqualLuaArrays(expected: Array<unknown> | LuaTable<number, unknown> | null): ExpectationResult;
  }
}
