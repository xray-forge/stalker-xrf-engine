import { describe, expect, it } from "@jest/globals";

import { monsters } from "@/engine/lib/constants/monsters";

describe("'monsters' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(monsters).forEach(([key, value]) => expect(key).toBe(value));
  });
});
