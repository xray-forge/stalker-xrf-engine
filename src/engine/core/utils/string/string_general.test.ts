import { describe, expect, it } from "@jest/globals";

import { containsSubstring, trimString } from "@/engine/core/utils/string/string_general";

describe("trimString", () => {
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

describe("containsSubstring", () => {
  it("should correctly check substrings", () => {
    expect(containsSubstring("", "")).toBe(false);
    expect(containsSubstring("abc", "")).toBe(false);
    expect(containsSubstring("", "abc")).toBe(false);

    expect(containsSubstring("abc", "a")).toBe(true);
    expect(containsSubstring("abc", "B")).toBe(true);
    expect(containsSubstring("Some Value", "value")).toBe(true);
    expect(containsSubstring("Some Value", "missing")).toBe(false);

    expect(containsSubstring("abc", "a.c")).toBe(true);
    expect(containsSubstring("abc", ".")).toBe(true);
  });
});
