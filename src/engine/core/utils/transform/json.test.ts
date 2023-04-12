import { describe, expect, it } from "@jest/globals";

import { quoted } from "#/utils";

import { toJSON } from "@/engine/core/utils/transform/json";

describe("'json' util", () => {
  it("should correctly stringify simple types", () => {
    expect(toJSON("abc")).toBe(quoted("abc"));
    expect(toJSON("bca")).toBe(quoted("bca"));
    expect(toJSON(123)).toBe("123");
    expect(toJSON(321)).toBe("321");
    expect(toJSON(true)).toBe("<bool: true>");
    expect(toJSON(false)).toBe("<bool: false>");
    expect(toJSON(null)).toBe("<nil>");
    expect(toJSON(undefined)).toBe("<nil>");
  });

  it("should correctly stringify tables", () => {
    expect(toJSON({})).toBe("{}");
    expect(toJSON({ a: 10 })).toBe(`{${quoted("a")}: 10}`);
    expect(toJSON({ b: "ab", c: 5, d: false, e: null })).toBe(
      `{${quoted("b")}: "ab", "c": 5, "d": <bool: false>, "e": <nil>}`
    );
    expect(toJSON({ a: 10, b: { c: 1234 } })).toBe(`{${quoted("a")}: 10, "b": {"c": 1234}}`);
  });

  it("should correctly stringify circular references", () => {
    const base = { nested: { circular: {} } };

    base.nested.circular = base;

    expect(toJSON(base)).toBe(`{${quoted("nested")}: {"circular": <circular_reference>}}`);
  });

  it("should correctly limit depth", () => {
    const base = { nested: { nested: { nested: { nested: {} } } } };

    expect(toJSON(base, " ", 3)).toBe(`{${quoted("nested")}: {"nested": {"nested": {"nested": <depth_limit>}}}}`);
  });
});
