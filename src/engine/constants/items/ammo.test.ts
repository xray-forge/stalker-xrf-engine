import { describe, expect, it } from "@jest/globals";

import { ammo } from "@/engine/constants/items/ammo";

describe("ammo constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(ammo).forEach(([key, value]) => expect(key).toBe(value));
  });
});
