declare module "fengari" {
  /**
   * todo;
   */
  interface ILuaString {

  }

  /**
   * todo;
   */
  interface ILuaState {

  }

  /**
   * todo;
   */
  interface ILuaConf {
  }

  /**
   * todo;
   */
  interface ILua {
    lua_getglobal(state: ILuaState, name: string): unknown;
    lua_getfield(state: ILuaState, index: number, name: string): unknown;
    lua_pushstring(state: ILuaState, luaString: ILuaString): unknown;
    lua_call(state: ILuaState, parametersCount: number, returnValuesCount: number): unknown;
    lua_pushvalue(state: ILuaState, index: number): unknown;
    lua_pop(state: ILuaState, index: number): unknown;
    lua_isnil(state: ILuaState, index: number): boolean
    lua_tostring(state: ILuaState, index: number): ILuaString;
  }

  /**
   * todo;
   */
  interface ILualib {
    luaL_openlibs(state: ILuaState): void;
  }

  /**
   * todo;
   */
  interface ILauxlib {
    luaL_newstate(): ILuaState;
    luaL_tolstring(state: ILuaState, index: number): ILuaString;
  }

  const luaconf: ILuaConf;
  const lua: ILua;
  const lauxlib: ILauxlib;
  const lualib: ILualib;
  const to_jsstring: (value: ILuaString) => string;
  const to_luastring: (value: string) => ILuaString;
}
