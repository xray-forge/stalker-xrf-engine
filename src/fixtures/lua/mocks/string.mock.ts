import { ILuaString, lauxlib, lua, lualib, to_jsstring, to_luastring } from "fengari";

import { NIL } from "@/engine/lib/constants/words";
import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export const string = {
  format: (base: string, ...replacements: Array<unknown>) => {
    let result: string = base;

    for (const replacement of replacements) {
      if (base.indexOf("%s") === -1) {
        throw new Error("String format error - no target for interpolation found.");
      }

      result = result.replace("%s", tostring(replacement));
    }

    return result;
  },
  find: (
    target: string,
    pattern: string,
    startIndex?: number
  ): [Optional<number>, Optional<number>, Optional<string>] => {
    const L = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "string");
    lua.lua_getfield(L, -1, "find");
    lua.lua_pushstring(L, to_luastring(target));
    lua.lua_pushstring(L, to_luastring(pattern));

    if (typeof startIndex === "number") {
      lua.lua_pushnumber(L, startIndex);
      lua.lua_call(L, 3, 3);
    } else {
      lua.lua_call(L, 2, 3);
    }

    const start: Optional<number> = lua.lua_isnil(L, -3) ? null : lua.lua_tonumber(L, -3);
    const end: Optional<number> = lua.lua_isnil(L, -2) ? null : lua.lua_tonumber(L, -2);

    const matchData: Optional<ILuaString> = lauxlib.luaL_tolstring(L, -1);
    const match: Optional<string> = matchData ? to_jsstring(matchData) : null;

    return [start, end, match === NIL ? null : match];
  },
  gfind: (target: string, pattern: string) => string.gmatch(target, pattern),
  gmatch: (target: string, pattern: string): Array<string> => {
    const L = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "string");
    lua.lua_getfield(L, -1, "gmatch");
    lua.lua_pushstring(L, to_luastring(target));
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
    const L = lauxlib.luaL_newstate();

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
    const L = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(L);

    lua.lua_getglobal(L, "string");
    lua.lua_getfield(L, -1, "len");
    lua.lua_pushstring(L, to_luastring(target));
    lua.lua_call(L, 1, 1);

    return Number.parseInt(to_jsstring(lauxlib.luaL_tolstring(L, -1)));
  },
};
