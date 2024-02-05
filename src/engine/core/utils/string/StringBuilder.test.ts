import { describe, expect, it } from "@jest/globals";

import { StringBuilder } from "@/engine/core/utils/string/StringBuilder";

describe("StringBuilder", () => {
  it("should correctly build empty strings", () => {
    const stringBuilder: StringBuilder = new StringBuilder();

    expect(stringBuilder.build()).toBe("");
    expect(stringBuilder.build("|")).toBe("");

    stringBuilder.append("");
    stringBuilder.append("");

    expect(stringBuilder.build()).toBe("");
    expect(stringBuilder.build("|")).toBe("|");
  });

  it("should correctly build generic strings", () => {
    const stringBuilder: StringBuilder = new StringBuilder();

    expect(stringBuilder.build()).toBe("");

    stringBuilder.append("abc");
    stringBuilder.append("def");

    expect(stringBuilder.build()).toBe("abcdef");
    expect(stringBuilder.build("|")).toBe("abc|def");
    expect(stringBuilder.build(",")).toBe("abc,def");
  });
});
