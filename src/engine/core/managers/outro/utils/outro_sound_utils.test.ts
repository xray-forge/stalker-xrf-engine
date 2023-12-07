import { describe, expect, it } from "@jest/globals";

import { calculateSoundFade } from "@/engine/core/managers/outro/utils/outro_sound_utils";

describe("outro sound utils", () => {
  it("should correctly calculate fade based on factor", () => {
    expect(calculateSoundFade(1, 1, 2, 21, 29)).toBe(21);
    expect(calculateSoundFade(2, 1, 2, 21, 29)).toBe(29);
    expect(calculateSoundFade(3, 1, 2, 21, 29)).toBe(29);
    expect(calculateSoundFade(4, 1, 2, 21, 29)).toBe(29);
  });

  it("should correctly calculate fade based on fade volume", () => {
    expect(calculateSoundFade(1, 1, 2, 25, 30)).toBe(25);
    expect(calculateSoundFade(1, 1, 2, 30, 25)).toBe(30);
    expect(calculateSoundFade(1.5, 1, 2, 1.25, 2.55)).toBe(1.9);
    expect(calculateSoundFade(1.5, 1, 2, 1.3, 2.15)).toBe(1.725);
    expect(calculateSoundFade(1.5, 1, 2, 1.4, 2.15)).toBe(1.775);
    expect(calculateSoundFade(1.5, 1, 2, 1.5, 2.1)).toBe(1.8);
  });

  it("should correctly calculate fade based on stop points", () => {
    expect(calculateSoundFade(1.5, 1.5, 2.5, 1.25, 2.55)).toBe(1.25);
    expect(calculateSoundFade(1.5, 15, 25, 1.25, 2.55)).toBe(1.25);
    expect(calculateSoundFade(1.5, 150, 250, 1.25, 2.55)).toBe(1.25);

    expect(calculateSoundFade(1.5, 2.5, 1.5, 1.25, 2.55)).toBe(2.55);
    expect(calculateSoundFade(1.5, 25, 15, 1.25, 2.55)).toBe(2.55);
    expect(calculateSoundFade(1.5, 250, 150, 1.25, 2.55)).toBe(2.55);
  });
});
