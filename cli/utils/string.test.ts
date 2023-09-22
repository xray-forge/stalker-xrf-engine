import { describe, expect, it } from "@jest/globals";

import { quoted } from "#/utils/string";

describe("string utils", () => {
  it("quoted should correctly wrap", () => {
    expect(quoted("example")).toBe(`"example"${""}`);
    expect(quoted("123")).toBe(`"123"${""}`);
  });
});
