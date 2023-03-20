import { describe, expect, it } from "@jest/globals";

import { quoted } from "#/utils";

import { stringifyAsJson } from "@/engine/core/utils/transform/json";

describe("'stringifyAsJson' util", () => {
  it("should correctly stringify simple types", () => {
    expect(stringifyAsJson("abc")).toBe(quoted("abc"));
    expect(stringifyAsJson("bca")).toBe(quoted("bca"));
    expect(stringifyAsJson(123)).toBe("123");
    expect(stringifyAsJson(321)).toBe("321");
    expect(stringifyAsJson(true)).toBe("<bool: true>");
    expect(stringifyAsJson(false)).toBe("<bool: false>");
    expect(stringifyAsJson(null)).toBe("<nil>");
    expect(stringifyAsJson(undefined)).toBe("<nil>");
  });

  it("should correctly stringify tables", () => {
    expect(stringifyAsJson({})).toBe("{}");
    expect(stringifyAsJson({ a: 10 })).toBe(`{${quoted("a")}: 10}`);
    expect(stringifyAsJson({ b: "ab", c: 5, d: false, e: null })).toBe(
      `{${quoted("b")}: "ab", "c": 5, "d": <bool: false>, "e": <nil>}`
    );
    expect(stringifyAsJson({ a: 10, b: { c: 1234 } })).toBe(`{${quoted("a")}: 10, "b": {"c": 1234}}`);
  });

  it("should correctly stringify circular references", () => {
    const base = { nested: { circular: {} } };

    base.nested.circular = base;

    expect(stringifyAsJson(base)).toBe(`{${quoted("nested")}: {"circular": <circular_reference>}}`);
  });

  it("should correctly limit depth", () => {
    const base = { nested: { nested: { nested: { nested: {} } } } };

    expect(stringifyAsJson(base, " ", 3)).toBe(
      `{${quoted("nested")}: {"nested": {"nested": {"nested": <depth_limit>}}}}`
    );
  });
});
