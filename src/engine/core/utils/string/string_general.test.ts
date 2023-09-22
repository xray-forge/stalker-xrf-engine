import { describe, expect, it } from "@jest/globals";

import { trimString } from "@/engine/core/utils/string/string_general";

describe("string utils", () => {
  it("trimString should correctly trim string values", () => {
    expect(trimString("")).toBe("");
    expect(trimString("abc")).toBe("abc");
    expect(trimString("abc   ")).toBe("abc");
    expect(trimString("   abc")).toBe("abc");
    expect(trimString("   abc   ")).toBe("abc");
    expect(trimString("   a b c   ")).toBe("a b c");
    expect(trimString("a b c   ")).toBe("a b c");
    expect(trimString("   a b c")).toBe("a b c");
  });
});
