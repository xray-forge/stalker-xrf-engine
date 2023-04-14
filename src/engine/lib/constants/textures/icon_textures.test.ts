import { describe, expect, it } from "@jest/globals";

import { iconTextures } from "@/engine/lib/constants/textures/icon_textures";

describe("'icon_textures' constants integrity", () => {
  it("should match key-value entries", () => {
    // Slashes are not valid key names so replace them with '_'.
    Object.entries(iconTextures).forEach(([key, value]) => expect(key).toBe(String(value).replace(/\\/g, "_")));
  });
});
