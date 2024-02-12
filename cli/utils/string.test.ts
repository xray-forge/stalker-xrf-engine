import { describe, expect, it } from "@jest/globals";

import { quoted } from "#/utils/string";

describe("quoted util", () => {
  it("should correctly wrap", () => {
    expect(quoted("example")).toBe(`"example"${""}`);
    expect(quoted("123")).toBe(`"123"${""}`);
  });
});
