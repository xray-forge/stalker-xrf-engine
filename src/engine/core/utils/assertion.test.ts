import { describe, expect, it } from "@jest/globals";

import { abort, assert, assertBoolean, assertDefined } from "@/engine/core/utils/assertion";

describe("'debug' utils", () => {
  it("'abort' should correctly throw exceptions", () => {
    expect(() => abort("Basic.")).toThrow("Basic.");
    expect(() => abort("Basic: '%s'.", "reason")).toThrow("Basic: 'reason'.");
    expect(() => abort("Complex: '%s', '%s', '%s'.", "reason", 1, true)).toThrow("Complex: 'reason', '1', 'true'.");
  });

  it("'assert' should correctly check and throw exceptions", () => {
    expect(() => assert(false, "Basic.")).toThrow("Basic.");
    expect(() => assert(2 + 2 === 5, "Basic: '%s'.", "reason")).toThrow("Basic: 'reason'.");
    expect(() => assert(false, "Complex: '%s', '%s', '%s'.", "reason", 1, true)).toThrow(
      "Complex: 'reason', '1', 'true'."
    );

    expect(() => assert(true, "Basic.")).not.toThrow();
    expect(() => assert(1 === 1, "Basic: '%s'.")).not.toThrow();
    expect(() => assert("a" === "a", "Complex: '%s', '%s', '%s'.", "reason", 1, true)).not.toThrow();
  });

  it("'assertDefined' should correctly check and throw exceptions", () => {
    expect(() => assertDefined(null)).toThrow();
    expect(() => assertDefined("abc")).not.toThrow();
    expect(() => assertDefined(123)).not.toThrow();
    expect(() => assertDefined(true)).not.toThrow();
    expect(() => assertDefined({})).not.toThrow();
    expect(() => assertDefined([])).not.toThrow();
  });

  it("'assertBoolean' should correctly check and throw exceptions", () => {
    expect(() => assertBoolean(null)).toThrow();
    expect(() => assertBoolean({})).toThrow();
    expect(() => assertBoolean("abc")).toThrow();
    expect(() => assertBoolean(123)).toThrow();
    expect(() => assertBoolean([])).toThrow();
    expect(() => assertDefined(true)).not.toThrow();
    expect(() => assertDefined(false)).not.toThrow();
  });
});
