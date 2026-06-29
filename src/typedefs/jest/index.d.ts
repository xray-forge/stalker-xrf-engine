export * from "expect";

/**
 * Extension methods for jest expect checks.
 */
declare module "expect" {
  export interface Matchers<R extends void | Promise<void>> {
    toHaveBeenCalledWith(...expected: Array<unknown>): R;
    toHaveBeenLastCalledWith(...expected: Array<unknown>): R;
    toHaveBeenNthCalledWith(nthCall: number, ...expected: Array<unknown>): R;
    toEqualLuaTables(expected: Record<string, any> | LuaTable | null): ExpectationResult;
    toStrictEqualLuaTables(expected: Record<string, any> | LuaTable | null): ExpectationResult;
    toEqualLuaArrays(expected: Array<unknown> | LuaTable<number, unknown> | null): ExpectationResult;
    toStrictEqualLuaArrays(expected: Array<unknown> | LuaTable<number, unknown> | null): ExpectationResult;
  }
}
