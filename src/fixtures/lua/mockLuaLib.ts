import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { math } from "@/fixtures/lua/mocks/math.mocks";
import { string } from "@/fixtures/lua/mocks/string.mock";
import { table } from "@/fixtures/lua/mocks/table.mock";

/**
 * todo;
 */
export function mockLuaLib(): void {
  // @ts-ignore
  global.LuaTable = MockLuaTable;
  // @ts-ignore
  global.string = string;
  // @ts-ignore
  global.table = table;
  // @ts-ignore
  global.math = math;

  // @ts-ignore
  global.tonumber = (value: unknown) => {
    const result: number = Number.parseFloat(String(value));

    if (Number.isNaN(result)) {
      return null;
    } else {
      return result;
    }
  };
  // @ts-ignore
  global.type = (value: unknown): string => typeof value;
  // @ts-ignore
  global.error = (message: string): string => {
    throw new Error(message);
  };
}
