import { describe, expect, it } from "@jest/globals";

import { luaTableToArray } from "@/fixtures/lua/utils";
import { parseNames, parseNumbers } from "@/mod/scripts/utils/parse";

describe("'parse' utils", () => {
  it("Should correctly parse names array", () => {
    expect(luaTableToArray(parseNames("a, b, c"))).toEqual(["a", "b", "c"]);
    expect(luaTableToArray(parseNames("name_1, example_b, name_complex_here"))).toEqual([
      "name_1",
      "example_b",
      "name_complex_here",
    ]);
  });

  it("Should correctly parse numbers array", () => {
    expect(luaTableToArray(parseNumbers("1, 2, 3, 4"))).toEqual([1, 2, 3, 4]);
    expect(luaTableToArray(parseNumbers("1.5, 2.33, 3.0"))).toEqual([1.5, 2.33, 3.0]);
    expect(luaTableToArray(parseNumbers("15, 0, -43, 9999"))).toEqual([15, 0, -43, 9999]);
  });
});
