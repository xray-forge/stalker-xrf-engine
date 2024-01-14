import { describe, expect, it } from "@jest/globals";

import { between, chance, pickRandom } from "@/engine/core/utils/random";

describe("chance util", () => {
  it("should correctly randomize", () => {
    expect(chance(100)).toBeTruthy();
    expect(chance(1000, 1000)).toBeTruthy();
    expect(chance(0)).toBeFalsy();
    expect(chance(0, 1000)).toBeFalsy();
  });
});

describe("between util", () => {
  it("should correctly randomize", () => {
    expect(() => between(100, 1)).toThrow("Expected range to be correct in 'between' util, 100 > 1.");

    const first: number = between(1, 5);

    expect(first >= 1).toBe(true);
    expect(first <= 5).toBe(true);

    const second: number = between(25.2, 100);

    expect(second >= 25.2).toBe(true);
    expect(second <= 100).toBe(true);
  });
});

describe("pickRandom util", () => {
  it("should correctly randomize", () => {
    expect(pickRandom(1)).toBe(1);
    expect(pickRandom(1, 1, 1)).toBe(1);
    expect([1, 2, 3]).toContain(pickRandom(1, 2, 3));
    expect([1, 2, 3]).toContain(pickRandom(1, 2, 3));
    expect([1, 2, 3]).toContain(pickRandom(1, 2, 3));
  });
});
