import { describe, expect, it } from "@jest/globals";

describe("'lua' VM mocks to test libraries", () => {
  it("string gmatch mock should be applied", () => {
    expect(string.gmatch("55", "%d+")).toEqual(["55"]);
    expect(string.gmatch("11 2 33 4", "%d+")).toEqual(["11", "2", "33", "4"]);
    expect(string.gmatch("", "%d+")).toEqual([]);
  });

  it("string len mock should be applied", () => {
    expect(string.len("")).toBe(0);
    expect(string.len("a")).toBe(1);
    expect(string.len("ab")).toBe(2);
    expect(string.len("abc")).toBe(3);
  });

  it("table insert mock should be applied", () => {
    const a = new LuaTable();
  });
});
