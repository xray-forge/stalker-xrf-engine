/**
 * Utility to get current filename, similar to __filename in nodejs.
 */
declare const $filename: string;

/**
 * Utility to transform TS provided array to a lua one.
 * Just wrapper that is stripped compile time, but simplifies unit testing with TS.
 */
declare function $fromArray<T>(array: Array<T>): LuaTable<number, T>;

/**
 * Utility to transform LUA array to JS array.
 * Just wrapper that is stripped compile time, but simplifies unit testing with TS.
 */
declare function $fromLuaArray<T>(array: LuaTable<number, T>): Array<T>;

/**
 * Utility to transform TS provided object to a lua table.
 * Just wrapper that is stripped compile time, but simplifies unit testing with TS.
 */
declare function $fromObject<K extends string | number, T>(object: Record<K, T>): LuaTable<K, T>;
declare function $fromObject<D>(object: D): LuaTable<keyof D, D[keyof D]>;

/**
 * Utility to transform LUA provided table to a TS one.
 * Just wrapper that is stripped compile time, but simplifies unit testing with TS.
 */
declare function $fromLuaTable<K extends string | number, T>(object: LuaTable<K, T>): Record<K, T>;
declare function $fromLuaTable<D>(object: LuaTable<keyof D, D[keyof D]>): D;
