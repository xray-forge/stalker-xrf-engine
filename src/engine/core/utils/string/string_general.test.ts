import { describe, expect, it } from "@jest/globals";

import { trimString } from "@/engine/core/utils/string/string_general";

describe("trimString util", () => {
  it("should correctly trim string values", () => {
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

describe("containsSubstring util", () => {
  it.todo("should correctly check substrings");
});
