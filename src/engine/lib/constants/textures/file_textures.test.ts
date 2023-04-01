import { describe, expect, it } from "@jest/globals";

import { fileTextures } from "@/engine/lib/constants/textures/file_textures";

describe("'file_textures' constants integrity", () => {
  it("should match key-value entries", () => {
    // Slashes are not valid key names so replace them with '_'.
    Object.entries(fileTextures).forEach(([key, value]) => expect(key).toBe(String(value).replace(/\\/g, "_")));
  });
});
