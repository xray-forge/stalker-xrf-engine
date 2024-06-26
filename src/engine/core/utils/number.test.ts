import { describe, expect, it } from "@jest/globals";

import { clamp, range, round, roundWithPrecision } from "@/engine/core/utils/number";

describe("clamp util", () => {
  it("should correctly limit numbers", () => {
    expect(clamp(100, 10, 50)).toBe(50);
    expect(clamp(50, 10, 50)).toBe(50);
    expect(clamp(0, 10, 50)).toBe(10);
    expect(clamp(10, 10, 50)).toBe(10);
    expect(clamp(25, 10, 50)).toBe(25);
  });
});

describe("round util", () => {
  it("should correctly round value", () => {
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

describe("roundWithPrecision util", () => {
  it("should correctly round value with precision", () => {
    expect(roundWithPrecision(0)).toBe(0);
    expect(roundWithPrecision(-1)).toBe(-1);
    expect(roundWithPrecision(1)).toBe(1);
    expect(roundWithPrecision(10)).toBe(10);

    expect(roundWithPrecision(10.4)).toBe(10);
    expect(roundWithPrecision(10.5)).toBe(11);
    expect(roundWithPrecision(10.123456789)).toBe(10);
    expect(roundWithPrecision(10.123456789, 1)).toBe(10.1);
    expect(roundWithPrecision(10.123456789, 2)).toBe(10.12);
    expect(roundWithPrecision(10.123456789, 3)).toBe(10.123);
    expect(roundWithPrecision(10.123456789, 4)).toBe(10.1235);
    expect(roundWithPrecision(10.123456789, 5)).toBe(10.12346);

    expect(roundWithPrecision(-10.4)).toBe(-10);
    expect(roundWithPrecision(-10.5)).toBe(-11);
    expect(roundWithPrecision(-10.123456789)).toBe(-10);
    expect(roundWithPrecision(-10.123456789, 1)).toBe(-10.1);
    expect(roundWithPrecision(-10.123456789, 2)).toBe(-10.12);
    expect(roundWithPrecision(-10.123456789, 3)).toBe(-10.123);
    expect(roundWithPrecision(-10.123456789, 4)).toBe(-10.1235);
    expect(roundWithPrecision(-10.123456789, 5)).toBe(-10.12346);
  });
});

describe("range util", () => {
  it("should correctly generate number ranges", () => {
    expect(range(3)).toEqual([0, 1, 2]);
    expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(3, 2)).toEqual([2, 3, 4]);
    expect(range(5, 2)).toEqual([2, 3, 4, 5, 6]);
  });
});
