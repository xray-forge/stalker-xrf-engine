import { describe, expect, it } from "@jest/globals";

import { LuaArray } from "@/engine/lib/types";
import { luaTableToArray } from "@/fixtures/lua/mocks/utils";

describe("'lua' VM mocks to test libraries", () => {
  it("string gmatch mock should be applied", () => {
    expect(string.gmatch("55", "%d+")).toEqual(["55"]);
    expect(string.gmatch("11 2 33 4", "%d+")).toEqual(["11", "2", "33", "4"]);
    expect(string.gmatch("", "%d+")).toEqual([]);
  });

  it("string gfind mock should be applied", () => {
    expect(string.gfind("55", "%d+")).toEqual(["55"]);
    expect(string.gfind("11 2 33 4", "%d+")).toEqual(["11", "2", "33", "4"]);
    expect(string.gfind("", "%d+")).toEqual([]);
  });

  it("string gsub should be applied", () => {
    expect(string.sub("55", 1, 2)).toBe("55");
    expect(string.sub("1234", 2, 3)).toBe("23");
    expect(string.sub("1234", 6, 7)).toBe("");
    expect(string.sub("1234", 5125, 7)).toBe("");
  });

  it("string find mock should be applied", () => {
    expect(string.find("abcd54abc", "54")).toEqual([5, 6, null]);
    expect(string.find("abcd54abc", "%d+")).toEqual([5, 6, ""]);
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
    expect(luaTableToArray(example)).toEqual(["a", "b"]);
  });

  it("math should be mocked", () => {
    expect(math).not.toBeNull();
    expect(math.pi).toBe(Math.PI);
  });
});
