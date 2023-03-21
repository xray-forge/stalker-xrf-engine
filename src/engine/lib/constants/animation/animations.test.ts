import { describe, expect, it } from "@jest/globals";

import { animations } from "@/engine/lib/constants/animation/animations";

describe("'animations' constants integrity", () => {
  it("should match key-value entries", () => {
    // Slashes are not valid key names so replace them with '_'.
    Object.entries(animations).forEach(([key, value]) => {
      expect(key).toBe(String(value).replace(/\\/g, "_").slice(0, -4));
    });
  });
});
