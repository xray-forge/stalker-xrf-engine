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
