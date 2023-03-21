import { describe, expect, it } from "@jest/globals";

import { food } from "@/engine/lib/constants/items/food";

describe("'food' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(food).forEach(([key, value]) => expect(key).toBe(value));
  });
});
