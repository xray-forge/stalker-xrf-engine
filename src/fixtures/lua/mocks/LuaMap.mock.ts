import type { AnyObject, TIndex } from "@/engine/lib/types";

/**
 * Mock `tstl` map data structure.
 * In runtime objects, arrays and tables are same, but in test env have to mock them with compat and workarounds.
 */
export class MockLuaMap<K = unknown, V = unknown> extends Map<K, V> {
  public static mock<K extends AnyNotNil, V>(initial: Array<[K, V]> = []): LuaTable<K, V> {
    return new MockLuaMap(initial) as unknown as LuaTable<K, V>;
  }

  public static create<K extends AnyNotNil, V>(): MockLuaMap<K, V> {
    return new MockLuaMap();
  }

  /**
   * Get mock size in unified way.
   */
  public static getMockSize(table: LuaTable<any> | AnyObject): number {
    if (table instanceof MockLuaMap) {
      return (table as unknown as MockLuaMap).size;
    }

    return Object.keys(table).length;
  }

  /**
   * Create new map from JS array.
   */
  public static fromArray<T>(from: Array<T>, into: MockLuaMap<number, T> = new MockLuaMap()): MockLuaMap<number, T> {
    if (from instanceof MockLuaMap) {
      return from;
    } else if (from === null) {
      return from;
    }

    from.forEach((it, index) => into.set(index + 1, it));

    return into;
  }

  /**
   * Create new map from JS object.
   */
  public static fromObject<K extends keyof any, T>(from: Record<K, T>): MockLuaMap<K, T> {
    const mock: MockLuaMap<K, T> = new MockLuaMap();

    Object.entries(from).forEach(([key, value]) => {
      // Lua compatibility since all JS objects have string keys.
      if (!Number.isNaN(Number.parseInt(key))) {
        mock.set(Number.parseInt(key) as K, value as T);
      } else {
        mock.set(key as K, value as T);
      }
    });

    return mock;
  }

  /**
   * Create new object from lua mock.
   */
  public static toObject<K extends keyof any, T>(from: MockLuaMap<K, T>): Record<K, T> {
    const record: Record<K, T> = {} as Record<K, T>;

    for (const [k, v] of from.entries()) {
      record[k] = v;
    }

    return record;
  }

  /**
   * Create new object from LUA table.
   */
  public static mockToObject<K extends keyof any, T>(from: MockLuaMap<K, T>): Record<K, T> {
    return MockLuaMap.toObject(from as unknown as MockLuaMap<K, T>);
  }

  /**
   * Create new map from JS array.
   */
  public static mockFromObject<K extends keyof any, T>(from: Record<K, T>): MockLuaMap<K, T> {
    return MockLuaMap.fromObject(from) as unknown as MockLuaMap<K, T>;
  }

  /**
   * Check if table is empty.
   */
  public isEmpty(): boolean {
    return this.size === 0;
  }

  public override has(key: K): boolean {
    const value = this.get(key);

    // Lua compat -> checks if key is not null.
    return value !== null && value !== undefined;
  }

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
 * Just transform types of LuaTable to mockLuaMap.
 */
export function mockFromLuaMap<K extends AnyNotNil, V>(original: LuaMap<K, V>): MockLuaMap<K, V> {
  return original as unknown as MockLuaMap<K, V>;
}
