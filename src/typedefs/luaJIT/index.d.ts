declare namespace table {
  function insert<K extends AnyNotNil, V>(list: LuaTable<K, V>, value: V): void;
}

declare namespace string {
  function gfind(this: void, s: string, pattern: unknown, init?: number, plain?: boolean): LuaIterable<string>;
}
