import { describe, expect, it, jest } from "@jest/globals";

import { toLogValue } from "@/engine/core/utils/logging/logging_casting";

describe("toLogValue util", () => {
  it("should correctly cast values", () => {
    expect(toLogValue(null)).toBe("<nil>");
    expect(toLogValue("")).toBe("<empty_str>");
    expect(toLogValue("abc")).toBe("abc");
    expect(toLogValue(1234)).toBe("1234");
    expect(toLogValue(true)).toBe("<boolean: true>");
    expect(toLogValue(false)).toBe("<boolean: false>");
    expect(toLogValue(Symbol.for("test"))).toBe("<object: Symbol(test)>");

    jest.spyOn(global, "type").mockReturnValueOnce("userdata");
    expect(toLogValue("mock")).toBe("<userdata>");
  });
});
