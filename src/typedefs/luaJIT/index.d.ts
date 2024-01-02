/**
 * Define global lua table interface extensions.
 * TSTL typing does not include all the methods available in xray engine build of LUA.
 */
declare namespace table {
  function concat<K extends AnyNotNil, V>(list: LuaTable<K, V>, separator: string): string;
  function insert<K extends AnyNotNil, V>(list: LuaTable<K, V>, value: V): void;
  function insert<V>(list: Array<V>, value: V): void;
  function sort<K extends AnyNotNil, V>(list: LuaTable<K, V>, cb: (left: V, right: V) => boolean): void;
  function remove(list: LuaTable<any>, index: number): void;
}

/**
 * Define global lua string interface extensions.
 * TSTL typing does not include all the methods available in xray engine build of LUA.
 */
declare namespace string {
  function gfind(this: void, s: string | number, pattern: unknown, init?: number, plain?: boolean): LuaIterable<string>;
}

/**
 * Define global lua math interface extensions.
 * TSTL typing does not include all the methods available in xray engine build of LUA.
 */
declare namespace math {
  function mod(target: number, module: number): number;
  function atan2(first: number, second: number): number;
}

/**
 * Extend ipairs to work both with records and lua tables.
 */
declare function ipairs<T>(table: LuaTable<number, T>): LuaIterable<LuaMultiReturn<[number, NonNullable<T>]>>;
