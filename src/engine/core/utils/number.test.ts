import { describe, expect, it } from "@jest/globals";

import { clampNumber, round } from "@/engine/core/utils/number";

describe("'number' utils", () => {
  it("'clamp' should correctly limit numbers", () => {
    expect(clampNumber(100, 10, 50)).toBe(50);
    expect(clampNumber(50, 10, 50)).toBe(50);
    expect(clampNumber(0, 10, 50)).toBe(10);
    expect(clampNumber(10, 10, 50)).toBe(10);
    expect(clampNumber(25, 10, 50)).toBe(25);
  });

  it("'round' should correctly round value", () => {
    expect(round(1.5)).toBe(2);
    expect(round(1.1)).toBe(1);
    expect(round(1.155)).toBe(1);
    expect(round(5)).toBe(5);
    expect(round(0)).toBe(0);
    expect(round(0.5)).toBe(1);
    expect(round(-0.6)).toBe(-1);
    expect(round(-0.5)).toBe(0);
    expect(round(-1.6)).toBe(-2);
    expect(round(-1.5)).toBe(-1);
    expect(round(-1.1)).toBe(-1);
  });
});
