declare namespace table {
  function insert<K extends AnyNotNil, V>(list: LuaTable<K, V>, value: V): void;
  function remove<K extends AnyNotNil, V>(list: LuaTable<K, V>, index: number): void;
  function sort<K extends AnyNotNil, V>(list: LuaTable<K, V>, cb: (left: V, right: V) => boolean): void;
}

declare namespace string {
  function gfind(this: void, s: string, pattern: unknown, init?: number, plain?: boolean): LuaIterable<string>;
}

declare namespace math {
  function atan2(first: number, second: number): number;
}
