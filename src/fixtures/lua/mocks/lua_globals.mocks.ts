import { ILuaState, lauxlib, lua, lualib, to_jsstring, to_luastring } from "fengari";

import { AnyArgs } from "@/engine/lib/types";
import { mockDebug } from "@/fixtures/lua/mocks/lua_debug.mock";
import { mockMath } from "@/fixtures/lua/mocks/lua_math.mocks";
import { mockPairs } from "@/fixtures/lua/mocks/lua_pairs.mock";
import { mockString } from "@/fixtures/lua/mocks/lua_string.mock";
import { mockTable } from "@/fixtures/lua/mocks/lua_table.mock";
import { mockToString } from "@/fixtures/lua/mocks/lua_tostring.mock";
import { mockType } from "@/fixtures/lua/mocks/lua_type.mock";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

export function mockLuaGlobals(): void {
  // @ts-ignore
  global._G = global;

  // @ts-ignore
  global.LuaTable = MockLuaTable;
  // @ts-ignore
  global.string = mockString;
  // @ts-ignore
  global.table = mockTable;
  // @ts-ignore
  global.math = mockMath;
  // @ts-ignore
  global.debug = mockDebug;

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
