import { describe, expect, it } from "@jest/globals";

import { chance, pickRandom } from "@/engine/core/utils/random";

describe("random utils", () => {
  it("chance should correctly randomize", () => {
    expect(chance(100)).toBeTruthy();
    expect(chance(1000, 1000)).toBeTruthy();
    expect(chance(0)).toBeFalsy();
    expect(chance(0, 1000)).toBeFalsy();

    expect(() => chance(101)).toThrow();
    expect(() => chance(200, 20)).toThrow();
    expect(() => chance(101, 200)).not.toThrow();
  });

  it("pickRandom should correctly randomize", () => {
    expect(pickRandom(1)).toBe(1);
    expect(pickRandom(1, 1, 1)).toBe(1);
    expect([1, 2, 3]).toContain(pickRandom(1, 2, 3));
    expect([1, 2, 3]).toContain(pickRandom(1, 2, 3));
    expect([1, 2, 3]).toContain(pickRandom(1, 2, 3));
  });
});
