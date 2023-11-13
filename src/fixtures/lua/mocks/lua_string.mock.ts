import { ILuaState, ILuaString, lauxlib, lua, lualib, to_jsstring, to_luastring } from "fengari";

import type { Optional } from "@/engine/lib/types";

/**
 * Mock lua global string methods.
 * Use lua VM to get 1-1 behaviour in some cases.
 */
export const mockString = {
  format: (base: string, ...replacements: Array<unknown>) => {
    let result: string = base;

    for (const replacement of replacements) {
      if (base.indexOf("%s") === -1) {
        throw new Error("String format error - no target for interpolation found.");
      }

      result = result.replace("%s", tostring(replacement));
    }

    result = result.replace(/%%/g, "%");

    return result;
  },
  find: (target: string, pattern: string, startIndex?: number): Array<Optional<string | number>> => {
    const L: ILuaState = lauxlib.luaL_newstate();
    const MAX_RETURN_VALUES: number = 16;

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "string");
    lua.lua_getfield(L, -1, "find");
    lua.lua_pushstring(L, to_luastring(target));
    lua.lua_pushstring(L, to_luastring(pattern));

    if (typeof startIndex === "number") {
      lua.lua_pushnumber(L, startIndex);
      lua.lua_call(L, 3, MAX_RETURN_VALUES);
    } else {
      lua.lua_call(L, 2, MAX_RETURN_VALUES);
    }

    const stackValues: Array<Optional<string | number>> = [];

    for (let it = 0; it < MAX_RETURN_VALUES; it++) {
      if (lua.lua_isnil(L, -1)) {
        stackValues.push(null);
      } else if (lua.lua_isnumber(L, -1)) {
        stackValues.push(lua.lua_tonumber(L, -1));
      } else {
        stackValues.push(to_jsstring(lua.lua_tostring(L, -1)));
      }

      lua.lua_pop(L, 1);
    }

    stackValues.reverse();

    const result: Array<Optional<string | number>> = [];

    for (let it = 0; it < stackValues.length; it++) {
      if (stackValues[it] === null) {
        break;
      }

      result.push(stackValues[it]);
    }

    // Ensure at least 3 args returned.
    while (result.length < 3) {
      result.push(null);
    }

    return result;
  },
  gsub: (target: string, pattern: string, selector: string): Array<Optional<string | number>> => {
    const L: ILuaState = lauxlib.luaL_newstate();
    const MAX_RETURN_VALUES: number = 2;

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "string");
    lua.lua_getfield(L, -1, "gsub");
    lua.lua_pushstring(L, to_luastring(String(target)));
    lua.lua_pushstring(L, to_luastring(String(pattern)));
    lua.lua_pushstring(L, to_luastring(String(selector)));

    lua.lua_call(L, 3, MAX_RETURN_VALUES);

    const stackValues: Array<Optional<string | number>> = [];

    for (let it = 0; it < MAX_RETURN_VALUES; it++) {
      if (lua.lua_isnil(L, -1)) {
        stackValues.push(null);
      } else if (lua.lua_isnumber(L, -1)) {
        stackValues.push(lua.lua_tonumber(L, -1));
      } else {
        stackValues.push(to_jsstring(lua.lua_tostring(L, -1)));
      }

      lua.lua_pop(L, 1);
    }

    stackValues.reverse();

    const result: Array<Optional<string | number>> = [];

    for (let it = 0; it < stackValues.length; it++) {
      if (stackValues[it] === null) {
        break;
      }

      result.push(stackValues[it]);
    }

    return result;
  },
  gfind: (target: string, pattern: string) => mockString.gmatch(target, pattern),
  match: (target: string, pattern: string) => mockString.gmatch(target, pattern),
  gmatch: (target: string, pattern: string): Array<string> => {
    const L: ILuaState = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "string");
    lua.lua_getfield(L, -1, "gmatch");
    lua.lua_pushstring(L, to_luastring(String(target)));
    lua.lua_pushstring(L, to_luastring(pattern));
    lua.lua_call(L, 2, 1);

    const result: Array<string> = [];

    lua.lua_pushvalue(L, -1);
    lua.lua_call(L, 0, 1);

    while (!lua.lua_isnil(L, -1)) {
      result.push(to_jsstring(lua.lua_tostring(L, -1)));

      lua.lua_pop(L, 1);
      lua.lua_pushvalue(L, -1);
      lua.lua_call(L, 0, 1);
    }

    return result;
  },
  sub(target: string, start: number, end: number): Optional<string> {
    const L: ILuaState = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "string");
    lua.lua_getfield(L, -1, "sub");
    lua.lua_pushstring(L, to_luastring(target));
    lua.lua_pushnumber(L, start);

    if (end === null || end === undefined) {
      lua.lua_pushnil(L);
    } else {
      lua.lua_pushnumber(L, typeof end === "number" ? end : Number.parseInt(end));
    }

    lua.lua_call(L, 3, 1);

    const matchData: Optional<ILuaString> = lauxlib.luaL_tolstring(L, -1);

    return matchData ? to_jsstring(matchData) : null;
  },
  len: (target: string): number => {
    const L: ILuaState = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "string");
    lua.lua_getfield(L, -1, "len");
    lua.lua_pushstring(L, to_luastring(target));
    lua.lua_call(L, 1, 1);

    return Number.parseInt(to_jsstring(lauxlib.luaL_tolstring(L, -1)));
  },
  lower: (target: string) => target.toLowerCase(),
};
