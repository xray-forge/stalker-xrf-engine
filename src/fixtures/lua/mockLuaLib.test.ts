import { describe, expect, it } from "@jest/globals";

import { LuaArray } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

describe("lua VM mocks to test libraries", () => {
  it("string gmatch mock should be applied", () => {
    expect(string.gmatch("55", "%d+")).toEqual(["55"]);
    expect(string.gmatch("11 2 33 4", "%d+")).toEqual(["11", "2", "33", "4"]);
    expect(string.gmatch("", "%d+")).toEqual([]);
    expect(string.gmatch("dynamic_default=clear,cloudy", "[^;]+")).toEqual(["dynamic_default=clear,cloudy"]);
  });

  it("string gfind mock should be applied", () => {
    expect(string.gfind("55", "%d+")).toEqual(["55"]);
    expect(string.gfind("11 2 33 4", "%d+")).toEqual(["11", "2", "33", "4"]);
    expect(string.gfind("", "%d+")).toEqual([]);
    expect(string.gfind("dynamic_default=clear,cloudy", "[^;]+")).toEqual(["dynamic_default=clear,cloudy"]);
  });

  it("string sub should be applied", () => {
    expect(string.sub("55", 1, 2)).toBe("55");
    expect(string.sub("1234", 2, 3)).toBe("23");
    expect(string.sub("1234", 6, 7)).toBe("");
    expect(string.sub("1234", 5125, 7)).toBe("");
  });

  it("string gsub should be applied", () => {
    expect(string.gsub(" aabc ", "^%s*(.-)%s*$", "%1")).toEqual(["aabc", 1]);
    expect(string.gsub("Lua is test", "test", "great")).toEqual(["Lua is great", 1]);
    expect(string.gsub("Lua is test test", "test", "great")).toEqual(["Lua is great great", 2]);
  });

  it("string find mock should be applied", () => {
    expect(string.find("abcd54abc", "54")).toEqual([5, 6, null]);
    expect(string.find("abcd54abc", "%d+")).toEqual([5, 6, ""]);
    expect(string.find("abcd54abc", "43")).toEqual([null, null, null]);
  });

  it("string find mock should handle many parameters", () => {
    const [s1, e1, a, b, c, d, e] = string.find("a.b.c.d.e", "([^.]+).([^.]+).([^.]+).([^.]+).([^.]+)");

    expect([s1, e1, a, b, c, d, e]).toEqual([1, 9, "a", "b", "c", "d", "e"]);

    const [s2, e2, h, i, j] = string.find("h.i.j", "([^.]+).([^.]+).([^.]+)");

    expect([s2, e2, h, i, j]).toEqual([1, 5, "h", "i", "j"]);
  });

  it("string format mock should be applied", () => {
    expect(string.format("abc%s", "54")).toBe("abc54");
    expect(string.format("%s-to-%s", "1", 1)).toBe("1-to-1");
    expect(string.format("%s:%s:%s and %s", "a", 1, true, null)).toBe("a:1:true and nil");
    expect(string.format("%s %% %s %% %s", "a", 1, true)).toBe("a % 1 % true");
    expect(string.format("%s %f", "b", 2.5)).toBe("b 2.5");
    expect(string.format("%s %s", "b", 2.2)).toBe("b 2.2");
  });

  it("string len mock should be applied", () => {
    expect(string.len("")).toBe(0);
    expect(string.len("a")).toBe(1);
    expect(string.len("ab")).toBe(2);
    expect(string.len("abc")).toBe(3);
  });

  it("table insert mock should be applied", () => {
    const example: LuaArray<string> = new LuaTable();

    table.insert(example, "a");
    table.insert(example, "b");

    expect(example.get(1)).toBe("a");
    expect(example.get(2)).toBe("b");
    expect(example).toEqualLuaArrays(["a", "b"]);
  });

  it("math should be mocked", () => {
    expect(math).not.toBeNull();
    expect(math.pi).toBe(Math.PI);
  });

  it("should mock LuaTable", () => {
    expect(LuaTable).toBe(MockLuaTable);
    expect(new MockLuaTable()).toEqual(new MockLuaTable());
    expect(new LuaTable()).toEqual(new MockLuaTable());
    expect(new (LuaTable as any)([["a", 1]])).toEqual(new MockLuaTable([["a", 1]]));
    expect(new (LuaTable as any)([["a", new (LuaTable as any)([["a", 1]])]])).toEqual(
      new MockLuaTable([["a", new MockLuaTable([["a", 1]])]])
    );
  });

  it("should mock tonumber", () => {
    expect(tonumber("1")).toBe(1);
    expect(tonumber("1.5")).toBe(1.5);
    expect(tonumber("-1.5")).toBe(-1.5);
    expect(tonumber("-1.5a")).toBeNull();
    expect(tonumber("abc")).toBeNull();
    expect(tonumber("")).toBeNull();
    expect(tonumber(true)).toBeNull();
    expect(tonumber(false)).toBeNull();
    expect(tonumber(null)).toBeNull();
    expect(tonumber(NaN)).toBeNull();
    expect(tonumber(undefined)).toBeNull();
  });
});
