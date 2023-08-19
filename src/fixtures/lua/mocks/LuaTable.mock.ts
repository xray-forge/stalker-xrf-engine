import { jest } from "@jest/globals";

import type { AnyObject, LuaArray, TIndex } from "@/engine/lib/types";

/**
 * todo;
 */
export class MockLuaTable<K, V> extends Map<K, V> {
  public static mock<K extends AnyNotNil, V>(): LuaTable<K, V> {
    return new MockLuaTable() as unknown as LuaTable<K, V>;
  }

  public static create<K extends AnyNotNil, V>(): MockLuaTable<K, V> {
    return new MockLuaTable();
  }

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
    if (from instanceof MockLuaTable) {
      return from;
    } else if (from === null) {
      return from;
    }

    const mock: MockLuaTable<number, T> = new MockLuaTable();

    from.forEach((it, index) => mock.set(index + 1, it));

    return mock;
  }

  /**
   * Create new map from JS object.
   */
  public static fromObject<K extends keyof any, T>(from: Record<K, T>): MockLuaTable<K, T> {
    const mock: MockLuaTable<K, T> = new MockLuaTable();

    Object.entries(from).forEach(([key, value]) => mock.set(key as K, value as T));

    return mock;
  }

  /**
   * Create new object from lua mock.
   */
  public static toObject<K extends keyof any, T>(from: MockLuaTable<K, T>): Record<K, T> {
    const record: Record<K, T> = {} as Record<K, T>;

    for (const [k, v] of from.entries()) {
      record[k] = v;
    }

    return record;
  }

  /**
   * Create new array from lua mock.
   */
  public static toArray<T>(from: MockLuaTable<number, T>): Array<T> {
    const array: Array<T> = [];

    for (const [k, v] of from.entries()) {
      array[k - 1] = v;
    }

    return array;
  }

  /**
   * Create new map from JS array.
   */
  public static mockFromArray<T>(from: Array<unknown>): LuaArray<T> {
    return MockLuaTable.fromArray(from) as unknown as LuaArray<T>;
  }

  /**
   * Create new array from LUA array.
   */
  public static mockToArray<T>(from: LuaArray<T>): Array<T> {
    return MockLuaTable.toArray(from as unknown as MockLuaTable<number, T>);
  }

  /**
   * Create new object from LUA table
   */
  public static mockToObject<K extends keyof any, T>(from: LuaTable<K, T>): Record<K, T> {
    return MockLuaTable.toObject(from as unknown as MockLuaTable<K, T>);
  }

  /**
   * Create new map from JS array.
   */
  public static mockFromObject<K extends keyof any, T>(from: Record<K, T>): LuaTable<K, T> {
    return MockLuaTable.fromObject(from) as unknown as LuaTable<K, T>;
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

  public getKeysArray(): Array<K> {
    return [...this.keys()];
  }

  public getValuesArray(): Array<V> {
    return [...this.values()];
  }

  public getEntriesArray(): Array<[K, V]> {
    return [...this.entries()];
  }

  public reset(): void {
    this.getKeysArray().forEach((it) => this.delete(it));
  }

  public map<U>(cb: (value: V, index: TIndex, array: Array<V>) => U): Array<U> {
    return this.getValuesArray().map((it, index, collection) => cb(it, index, collection));
  }
}

/**
 * todo;
 */
export function mockLuaTable<K extends AnyNotNil, V>(initial: Array<[K, V]> = []): LuaTable<K, V> {
  const table = new MockLuaTable<K, V>(initial);

  return table as unknown as LuaTable<K, V>;
}

/**
 * Just transform types of LuaTable to mockLuaTable.
 */
export function mockFromLuaTable<K extends AnyNotNil, V>(original: LuaTable<K, V>): MockLuaTable<K, V> {
  return original as unknown as MockLuaTable<K, V>;
}
