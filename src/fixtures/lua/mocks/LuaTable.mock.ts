import { jest } from "@jest/globals";

import { AnyObject, LuaArray } from "@/engine/lib/types";

/**
 * todo;
 */
export class MockLuaTable<K, V> extends Map<K, V> {
  /**
   * Get mock size in unified way.
   */
  public static getMockSize(table: LuaTable<any> | AnyObject): number {
    if (table instanceof MockLuaTable) {
      return (table as unknown as MockLuaTable<unknown, unknown>).size;
    }

    return Object.keys(table).length;
  }

  /**
   * Create new map from JS array.
   */
  public static fromArray<T>(from: Array<T>): MockLuaTable<number, T> {
    const mock: MockLuaTable<number, T> = new MockLuaTable();

    from.forEach((it, index) => mock.set(index + 1, it));

    return mock;
  }

  /**
   * Create new map from JS array.
   */
  public static mockFromArray<T>(from: Array<unknown>): LuaArray<T> {
    return MockLuaTable.fromArray(from) as unknown as LuaArray<T>;
  }

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
