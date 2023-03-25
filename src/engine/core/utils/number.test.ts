import { describe, expect, it } from "@jest/globals";

import { chance, clampNumber } from "@/engine/core/utils/number";

describe("'number' utils", () => {
  it("'clamp' should correctly limit numbers", () => {
    expect(clampNumber(100, 10, 50)).toBe(50);
    expect(clampNumber(50, 10, 50)).toBe(50);
    expect(clampNumber(0, 10, 50)).toBe(10);
    expect(clampNumber(10, 10, 50)).toBe(10);
    expect(clampNumber(25, 10, 50)).toBe(25);
  });

  it("'chance' should correctly randomize", () => {
    expect(chance(100)).toBeTruthy();
    expect(chance(1000, 1000)).toBeTruthy();
    expect(chance(0)).toBeFalsy();
    expect(chance(0, 1000)).toBeFalsy();

    expect(() => chance(101)).toThrow();
    expect(() => chance(200, 20)).toThrow();
    expect(() => chance(101, 200)).not.toThrow();
  });
});
