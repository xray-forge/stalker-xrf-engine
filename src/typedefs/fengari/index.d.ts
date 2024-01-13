declare module "fengari" {
  /**
   * Interface describing lua string.
   */
  interface ILuaString {

  }

  /**
   * Interface describing current lua VM state.
   */
  interface ILuaState {

  }

  /**
   * Interface describing lua VM config.
   */
  interface ILuaConf {
  }

  /**
   * Interface describing methods available in fengari VM.
   */
  interface ILua {
    lua_getglobal(state: ILuaState, name: string): unknown;
    lua_getfield(state: ILuaState, index: number, name: string): unknown;
    lua_pushstring(state: ILuaState, luaString: ILuaString): unknown;
    lua_call(state: ILuaState, parametersCount: number, returnValuesCount: number): unknown;
    lua_pushvalue(state: ILuaState, index: number): unknown;
    lua_pushinteger(state: ILuaState, number: number): unknown;
    lua_pushnumber(state: ILuaState, number: number): unknown;
    lua_pushnil(state: ILuaState,): unknown;
    lua_pop(state: ILuaState, count: number): unknown;
    lua_isnil(state: ILuaState, index: number): boolean
    lua_isnumber(state: ILuaState, index: number): boolean
    lua_tostring(state: ILuaState, index: number): ILuaString;
    lua_tonumber(state: ILuaState, index: number): number;
  }

  /**
   * Interface describing methods available in fengari VM lib.
   */
  interface ILualib {
    luaL_openlibs(state: ILuaState): void;
  }

  /**
   * Interface describing methods available in fengari LAUX lib.
   */
  interface ILauxlib {
    luaL_newstate(): ILuaState;
    luaL_checkinteger(value: number): ILuaString;
    luaL_tolstring(state: ILuaState, index: number): ILuaString;
  }

  const luaconf: ILuaConf;
  const lua: ILua;
  const lauxlib: ILauxlib;
  const lualib: ILualib;
  const to_jsstring: (value: ILuaString) => string;
  const to_luastring: (value: string) => ILuaString;
}
