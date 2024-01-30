/**
 * Marshal LUA library.
 * https://github.com/richardhundt/lua-marshal
 */
declare namespace marshal {
  /**
   * Deep clone a value (deep for tables and functions).
   */
  function clone<T extends LuaTable | Record<any, any>>(table: T): T;
  /**
   * Deserializes a byte stream to a value.
   */
  function decode<T extends LuaTable | Record<any, any> | Array<unknown>>(
    serialized: string, constants?: Partial<T>
  ): T;
  /**
   * Serialize a value to a byte stream.
   */
  function encode<T extends LuaTable | Record<any, any>>(table: T, constants?: Partial<T>): string;
}
