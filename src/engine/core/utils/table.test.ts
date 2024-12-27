import { describe, expect, it, jest } from "@jest/globals";

import { AnyObject, LuaArray, Optional, TName } from "@/engine/lib/types";

const tableUtils: {
  isEmpty: <T extends AnyNotNil>(target: Optional<LuaTable<T>>) => boolean;
  resetTable: <T extends AnyNotNil>(target: LuaTable<T>) => void;
  copyTable: (first: AnyObject, second: AnyObject) => AnyObject;
  mergeTables: <T extends AnyNotNil>(base: LuaTable<T>, ...rest: Array<LuaTable<T>>) => AnyObject;
  getTableKeys: <TKey extends AnyNotNil = AnyNotNil>(target: LuaTable<any>) => LuaArray<TKey>;
  getTableValuesAsSet: <TValue extends AnyNotNil = AnyNotNil>(
    target: LuaTable<any, TValue>
  ) => LuaTable<TValue, boolean>;
} = jest.requireActual("@/engine/core/utils/table");

describe("resetTable util", () => {
  it("should correctly empty provided table", () => {
    const first: LuaArray<number> = $fromArray([1, 2, 3, 4]);
    const second: LuaTable<string, string> = $fromObject<string, string>({ a: "1", b: "2" });

    tableUtils.resetTable(first);
    tableUtils.resetTable(second);

    expect(first).toEqualLuaArrays([]);
    expect(second).toEqualLuaTables({});
  });
});

describe("copyTable util", () => {
  it("should correctly copy table", () => {
    const from: LuaTable = new LuaTable();
    const to: LuaTable<string, unknown> = $fromObject<string, unknown>({ a: 1, b: 2, c: 3, d: { a: "a" } });

    expect(tableUtils.copyTable(to, from)).toEqualLuaTables({ a: 1, b: 2, c: 3, d: { a: "a" } });
    expect(to).toEqualLuaTables({ a: 1, b: 2, c: 3, d: { a: "a" } });
    expect(to.get("d")).not.toBe(from.get("d"));

    expect(tableUtils.copyTable(to, $fromObject({ x: 10 }))).toEqualLuaTables({
      a: 1,
      b: 2,
      c: 3,
      d: { a: "a" },
      x: 10,
    });
    expect(to).toEqualLuaTables({ a: 1, b: 2, c: 3, d: { a: "a" }, x: 10 });
  });
});

describe("mergeTables util", () => {
  it("should correctly merge tables", () => {
    const to: LuaTable<string, number> = $fromObject<string, number>({ a: 1 });

    expect(
      tableUtils.mergeTables(to, $fromObject<string, number>({ b: 2 }), $fromObject<string, number>({ c: 3 }))
    ).toEqualLuaTables({
      a: 1,
      b: 2,
      c: 3,
    });
    expect(to).toEqualLuaTables({ a: 1, b: 2, c: 3 });
  });
});

describe("isEmpty util", () => {
  it("should correctly check table emptiness", () => {
    expect(tableUtils.isEmpty($fromObject({ a: 1, b: 2 }))).toBe(false);
    expect(tableUtils.isEmpty($fromArray(["a", "b", "c", "d", "e"]))).toBe(false);
    expect(tableUtils.isEmpty($fromArray([1, 2, 3]))).toBe(false);
    expect(tableUtils.isEmpty(new LuaTable())).toBe(true);
    expect(tableUtils.isEmpty($fromArray<unknown>([]))).toBe(true);
    expect(tableUtils.isEmpty($fromObject<string, unknown>({}))).toBe(true);
    expect(tableUtils.isEmpty(null)).toBe(true);
  });
});

describe("getTableKeys util", () => {
  it("should correctly return list of keys", () => {
    expect(tableUtils.getTableKeys($fromObject<TName, TName>({}))).toEqualLuaArrays([]);
    expect(tableUtils.getTableKeys($fromObject({ a: 1, b: 2, c: 3 }))).toEqualLuaArrays(["a", "b", "c"]);
    expect(tableUtils.getTableKeys($fromObject({ x: "1", [1]: "2" }))).toEqualLuaArrays([1, "x"]);
  });
});

describe("getTableValuesAsSet util", () => {
  it("should correctly return list of keys", () => {
    expect(tableUtils.getTableValuesAsSet($fromObject<TName, TName>({}))).toEqualLuaTables({});
    expect(tableUtils.getTableValuesAsSet($fromObject({ a: 1, b: 2, c: "3" }))).toEqualLuaTables({
      [1]: true,
      [2]: true,
      "3": true,
    });
  });
});
