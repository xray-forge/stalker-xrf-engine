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
 * Utility to transform TS provided array to a lua one.
 * Just wrapper that is stripped compile time, but simplifies unit testing with TS.
 */
declare function $fromObject<K extends string | number, T>(object: Record<K, T>): LuaTable<K, T>;
