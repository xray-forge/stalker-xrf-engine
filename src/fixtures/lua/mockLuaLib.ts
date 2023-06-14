import { ILuaState, lauxlib, lua, lualib, to_jsstring, to_luastring } from "fengari";

import { AnyArgs } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { math } from "@/fixtures/lua/mocks/math.mocks";
import { mockPairs } from "@/fixtures/lua/mocks/pairs.mock";
import { string } from "@/fixtures/lua/mocks/string.mock";
import { table } from "@/fixtures/lua/mocks/table.mock";
import { mockToString } from "@/fixtures/lua/mocks/tostring.mock";
import { mockType } from "@/fixtures/lua/mocks/type.mock";

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
  global.$range = (start: number, end: number) => {
    const data: Array<number> = [];

    for (let it = start; it <= end; it++) {
      data.push(it);
    }

    return data;
  };

  // @ts-ignore
  global.$multi = (...args: AnyArgs) => [...args];

  // @ts-ignore
  global.tonumber = (value: unknown) => {
    const L: ILuaState = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "tonumber");
    lua.lua_pushstring(L, to_luastring(String(value)));
    lua.lua_call(L, 1, 1);

    const result: string = to_jsstring(lauxlib.luaL_tolstring(L, -1));
    const parsed: number = Number.parseFloat(result);

    return Number.isNaN(parsed) ? null : parsed;
  };
  // @ts-ignore
  global.tostring = jest.fn(mockToString);
  // @ts-ignore
  global.type = jest.fn(mockType);
  // @ts-ignore
  global.pairs = jest.fn(mockPairs);
  // @ts-ignore
  global.error = (message: string): string => {
    throw new Error(message);
  };
}
