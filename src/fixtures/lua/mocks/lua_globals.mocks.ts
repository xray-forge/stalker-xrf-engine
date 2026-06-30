import { ILuaState, lauxlib, lua, lualib, to_jsstring, to_luastring } from "fengari";

import { AnyArgs } from "@/engine/lib/types";
import { mockDebug } from "@/fixtures/lua/mocks/lua_debug.mock";
import { mockIo } from "@/fixtures/lua/mocks/lua_io.mock";
import { mockJit } from "@/fixtures/lua/mocks/lua_jit.mocks";
import { mockMath } from "@/fixtures/lua/mocks/lua_math.mocks";
import { mockString } from "@/fixtures/lua/mocks/lua_string.mock";
import { mockTable } from "@/fixtures/lua/mocks/lua_table.mock";
import { mockToString } from "@/fixtures/lua/mocks/lua_tostring.mock";
import { mockType } from "@/fixtures/lua/mocks/lua_type.mock";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

/**
 * Mock lua globals in node testing environment.
 */
export function mockLuaGlobals(): void {
  // @ts-ignore
  globalThis._G = globalThis;

  // @ts-ignore
  globalThis._VERSION = "fengari-jest";
  // @ts-ignore
  globalThis.LuaTable = MockLuaTable;
  // @ts-ignore
  globalThis.string = mockString;
  // @ts-ignore
  globalThis.table = mockTable;
  // @ts-ignore
  globalThis.math = mockMath;
  // @ts-ignore
  globalThis.debug = mockDebug;
  // @ts-ignore
  globalThis.io = mockIo;
  // @ts-ignore
  globalThis.jit = mockJit;

  // @ts-ignore
  globalThis.$range = (start: number, end: number) => {
    const data: Array<number> = [];

    for (let it = start; it <= end; it++) {
      data.push(it);
    }

    return data;
  };

  // @ts-ignore
  globalThis.$multi = (...args: AnyArgs) => [...args];

  // @ts-ignore
  globalThis.tonumber = (value: unknown) => {
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
  globalThis.tostring = jest.fn(mockToString);
  // @ts-ignore
  globalThis.collectgarbage = jest.fn(() => 1024);
  // @ts-ignore
  globalThis.type = jest.fn(mockType);
  // @ts-ignore
  globalThis.pairs = jest.fn((target: object) => Object.entries(target));
  // @ts-ignore
  globalThis.ipairs = jest.fn((target: object) => Object.entries(target));
  // @ts-ignore
  globalThis.error = (message: string): string => {
    throw new Error(message);
  };
}
