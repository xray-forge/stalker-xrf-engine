import { lauxlib, lua, lualib, to_jsstring, to_luastring } from "fengari";

/**
 * todo;
 */
export const string = {
  format: () => "",
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
