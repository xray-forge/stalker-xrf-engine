import { describe, expect, it } from "@jest/globals";

import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";

describe("'script_sounds' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(scriptSounds).forEach(([key, value]) => expect(key).toBe(value));
  });
});
