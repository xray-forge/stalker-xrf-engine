import { describe, expect, it } from "@jest/globals";

import { treasures } from "@/engine/lib/constants/treasures";

describe("'treasures' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(treasures).forEach(([key, value]) => expect(key).toBe(value));
  });
});
