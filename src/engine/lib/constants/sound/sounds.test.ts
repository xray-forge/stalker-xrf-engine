import { describe, expect, it } from "@jest/globals";

import { sounds } from "@/engine/lib/constants/sound/sounds";

describe("'sounds' constants integrity", () => {
  it("should match key-value entries", () => {
    // Slashes are not valid key names so replace them with '_'.
    Object.entries(sounds).forEach(([key, value]) => expect(key).toBe(String(value).replace(/\\/g, "_")));
  });
});
