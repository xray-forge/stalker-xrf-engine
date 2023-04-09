/**
 * todo;
 */
declare namespace table {
  function concat<K extends AnyNotNil, V>(list: LuaTable<K, V>, separator: string): string;
  function insert<K extends AnyNotNil, V>(list: LuaTable<K, V>, value: V): void;
  function insert<K extends AnyNotNil, V>(list: Array<V>, value: V): void;
  function remove<K extends AnyNotNil, V>(list: LuaTable<K, V>, index: number): void;
  function sort<K extends AnyNotNil, V>(list: LuaTable<K, V>, cb: (left: V, right: V) => boolean): void;
}

/**
 * todo;
 */
declare namespace string {
  function gfind(this: void, s: string | number, pattern: unknown, init?: number, plain?: boolean): LuaIterable<string>;
}

/**
 * todo;
 */
declare namespace math {
  function mod(target: number, module: number): number;
  function atan2(first: number, second: number): number;
}
