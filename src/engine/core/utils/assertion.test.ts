import { describe, expect, it } from "@jest/globals";
import { print_stack } from "xray16";

import { abort, assert, assertDefined, assertNonEmptyString, callstack } from "@/engine/core/utils/assertion";
import { mockDebug } from "@/fixtures/lua/mocks/lua_debug.mock";

describe("abort util", () => {
  it("abort should correctly throw exceptions", () => {
    expect(() => abort("Basic.")).toThrow("Basic.");
    expect(print_stack).toHaveBeenCalledTimes(1);

    expect(() => abort("Basic: %s.", "reason")).toThrow("Basic: reason.");
    expect(print_stack).toHaveBeenCalledTimes(2);

    expect(() => abort("Complex: %s, %s, %s.", "reason", 1, true)).toThrow("Complex: reason, 1, true.");
    expect(print_stack).toHaveBeenCalledTimes(3);
  });
});

describe("assert util", () => {
  it("assert should correctly check and throw exceptions", () => {
    expect(() => assert(false, "Basic.")).toThrow("Basic.");
    expect(() => assert(2 + 2 === 5, "Basic: %s.", "reason")).toThrow("Basic: reason.");
    expect(() => assert(false, "Complex: %s, %s, %s.", "reason", 1, true)).toThrow("Complex: reason, 1, true.");

    expect(() => assert(true, "Basic.")).not.toThrow();
    expect(() => assert(1 === 1, "Basic: %s.")).not.toThrow();
    expect(() => assert("a" === "a", "Complex: %s, %s, %s.", "reason", 1, true)).not.toThrow();
  });
});

describe("assertDefined util", () => {
  it("assertDefined should correctly check and throw exceptions", () => {
    expect(() => assertDefined(null)).toThrow();
    expect(() => assertDefined("abc")).not.toThrow();
    expect(() => assertDefined(123)).not.toThrow();
    expect(() => assertDefined(true)).not.toThrow();
    expect(() => assertDefined({})).not.toThrow();
    expect(() => assertDefined([])).not.toThrow();
  });
});

describe("assertNonEmptyString util", () => {
  it("assertNonEmptyString should correctly check and throw exceptions", () => {
    expect(() => assertNonEmptyString(null)).toThrow();
    expect(() => assertNonEmptyString("")).toThrow();
    expect(() => assertNonEmptyString("a")).not.toThrow();
    expect(() => assertNonEmptyString("abc")).not.toThrow();
    expect(() => assertNonEmptyString("dgef")).not.toThrow();
    expect(() => assertNonEmptyString("abcdefg")).not.toThrow();
  });
});

describe("callstack util", () => {
  it("callstack should correctly print debug stack", () => {
    callstack();
    callstack(6);
    callstack(4);

    expect(mockDebug.traceback).toHaveBeenNthCalledWith(1, 5);
    expect(mockDebug.traceback).toHaveBeenNthCalledWith(2, 6);
    expect(mockDebug.traceback).toHaveBeenNthCalledWith(3, 4);
  });
});
