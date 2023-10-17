import { AnyObject } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

/**
 * Mock default lua lib table methods.
 */
export const mockTable = {
  insert: (target: LuaTable, element: unknown) => {
    if (target instanceof Map) {
      target.set(target.size + 1, element);
    } else {
      target.set(target.length() + 1, element);
    }
  },
  size: (target: unknown): number => {
    if (target instanceof MockLuaTable) {
      return target.length();
    } else if (Array.isArray(target)) {
      return target.length;
    } else if (target && typeof target === "object") {
      return Object.keys(target).length;
    } else {
      throw new Error("Unexpected data provided for table size check mock.");
    }
  },
  random: (table: MockLuaTable) => {
    const entries = table.getEntriesArray();

    return entries.length ? entries[Math.floor(entries.length * Math.random())] : [null, null];
  },
  remove: (target: AnyObject, index: number) => {
    // Simulate lua behaviour by shifting all elements like with splice.
    if (target instanceof MockLuaTable) {
      const array = MockLuaTable.toArray(target);

      array.splice(index - 1, 1);

      target.reset();

      MockLuaTable.fromArray(array, target);

      return;
    } else if (Array.isArray(target)) {
      return target.splice(index - 1, 1);
    }

    throw new Error(`Currently '${typeof target}' is not supported.`);
  },
  concat: (target: AnyObject, char: string) => {
    if (Array.isArray(target)) {
      return target.join(char);
    } else if (target instanceof MockLuaTable) {
      return [...target.values()].join(char);
    } else {
      return Object.values(target).join(char);
    }
  },
  sort: <K, V>(target: MockLuaTable<K, V>, comparator: (a: V, b: V) => number): void => {
    const isArrayTable: boolean = target.getKeysArray()[0] === 1;
    const sortedValues = target.getEntriesArray().sort(([ak, av], [bk, bv]) => {
      const result = comparator(av, bv);

      // Handle lua true-false approach.
      if (typeof result === "boolean") {
        return result ? -1 : 1;
      }

      return result;
    });

    target.reset();

    if (isArrayTable) {
      sortedValues.forEach(([k, v], index) => target.set((index + 1) as unknown as K, v));
    } else {
      sortedValues.forEach(([k, v]) => target.set(k, v));
    }
  },
};
