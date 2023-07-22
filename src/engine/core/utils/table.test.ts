import { describe, expect, it, jest } from "@jest/globals";

import { AnyObject, LuaArray, Optional } from "@/engine/lib/types";

describe("'table' utils", () => {
  const tableUtils: {
    isEmpty: (target: Optional<LuaTable<any>>) => boolean;
    resetTable: (target: LuaTable<any>) => void;
    getTableSize: (target: LuaTable<any>) => number;
    copyTable: (first: AnyObject, second: AnyObject) => AnyObject;
    mergeTables: (base: LuaTable, ...rest: Array<LuaTable>) => AnyObject;
  } = jest.requireActual("@/engine/core/utils/table");

  it("'resetTable' should correctly empty provided table", () => {
    const first: LuaArray<number> = $fromArray([1, 2, 3, 4]);
    const second: LuaTable<string, string> = $fromObject<string, string>({ a: "1", b: "2" });

    tableUtils.resetTable(first);
    tableUtils.resetTable(second);

    expect(first).toEqualLuaArrays([]);
    expect(second).toEqualLuaTables({});
  });

  it("'copyTable' should correctly copy table", () => {
    const from: LuaTable<any> = new LuaTable();
    const to: LuaTable<any> = $fromObject({ a: 1, b: 2, c: 3, d: { a: "a" } });

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

  it("'mergeTables' should correctly merge tables", () => {
    const to: LuaTable<any> = $fromObject({ a: 1 });

    expect(
      tableUtils.mergeTables(to, $fromObject<any, any>({ b: 2 }), $fromObject<any, any>({ c: 3 }))
    ).toEqualLuaTables({
      a: 1,
      b: 2,
      c: 3,
    });
    expect(to).toEqualLuaTables({ a: 1, b: 2, c: 3 });
  });

  it("'getTableSize' should correctly get size of the table", () => {
    expect(tableUtils.getTableSize($fromObject({ a: 1, b: 2 }))).toBe(2);
    expect(tableUtils.getTableSize($fromArray(["a", "b", "c", "d", "e"]))).toBe(5);
    expect(tableUtils.getTableSize(new LuaTable())).toBe(0);
    expect(tableUtils.getTableSize($fromArray<unknown>([]))).toBe(0);
    expect(tableUtils.getTableSize($fromObject<string, unknown>({}))).toBe(0);
  });

  it("'isEmpty' should correctly check table emptiness", () => {
    expect(tableUtils.isEmpty($fromObject({ a: 1, b: 2 }))).toBe(false);
    expect(tableUtils.isEmpty($fromArray(["a", "b", "c", "d", "e"]))).toBe(false);
    expect(tableUtils.isEmpty($fromArray([1, 2, 3]))).toBe(false);
    expect(tableUtils.isEmpty(new LuaTable())).toBe(true);
    expect(tableUtils.isEmpty($fromArray<unknown>([]))).toBe(true);
    expect(tableUtils.isEmpty($fromObject<string, unknown>({}))).toBe(true);
    expect(tableUtils.isEmpty(null)).toBe(true);
  });
});
