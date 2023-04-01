import { describe, expect, it } from "@jest/globals";

import { inGameTextures } from "@/engine/lib/constants/textures/ingame_textures";

describe("'ingame_textures' constants integrity", () => {
  it("should match key-value entries", () => {
    // Slashes are not valid key names so replace them with '_'.
    Object.entries(inGameTextures).forEach(([key, value]) => expect(key).toBe(String(value).replace(/\\/g, "_")));
  });
});
