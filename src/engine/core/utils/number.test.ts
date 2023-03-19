import { describe, expect, it } from "@jest/globals";

import { clampNumber } from "@/engine/core/utils/number";

describe("'number' utils", () => {
  it("'clamp' should correctly limit numbers", () => {
    expect(clampNumber(100, 10, 50)).toBe(50);
    expect(clampNumber(50, 10, 50)).toBe(50);
    expect(clampNumber(0, 10, 50)).toBe(10);
    expect(clampNumber(10, 10, 50)).toBe(10);
    expect(clampNumber(25, 10, 50)).toBe(25);
  });
});
