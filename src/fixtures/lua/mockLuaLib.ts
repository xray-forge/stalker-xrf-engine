import { LuaTableMock } from "@/fixtures/lua/LuaTable.mock";
import { string } from "@/fixtures/lua/string.mock";
import { table } from "@/fixtures/lua/table.mock";

/**
 * todo;
 */
export function mockLuaLib(): void {
  // @ts-ignore
  global.LuaTable = LuaTableMock;
  // @ts-ignore
  global.string = string;
  // @ts-ignore
  global.table = table;
  // @ts-ignore
  global.tonumber = (value: number) => Number.parseFloat(value);
}
