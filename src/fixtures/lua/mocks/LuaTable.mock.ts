import { jest } from "@jest/globals";

/**
 * todo;
 */
export class MockLuaTable<K, V> extends Map<K, V> {
  /**
   * Mock to get rid of undefined and copy lua behaviour.
   */
  public override get = jest.fn((key: K): V | undefined => {
    const value = super.get(key);

    if (value === undefined) {
      return null as V;
    }

    return value;
  });

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
