/**
 * todo;
 */
export class MockLuaTable<K, V> extends Map<K, V> {
  public length(): number {
    return this.size;
  }
}

/**
 * todo;
 */
export function mockLuaTable<K extends AnyNotNil, V>(initial: Array<[K, V]> = []): LuaTable<K, V> {
  const table = new MockLuaTable<K, V>(initial);

  return table as unknown as LuaTable<K, V>;
}
